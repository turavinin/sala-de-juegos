import { Injectable } from '@angular/core';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { from, Observable } from 'rxjs';
import { N } from '@angular/cdk/keycodes';

@Injectable({
  providedIn: 'root'
})

export class SupabaseService {

  private client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
   }

  isValidLogin(email: string, password: string): Observable<{ success: boolean; message: string }> {
    return from(this._isValidLogin(email, password));
   }

  createUser(email: string, password: string, name: string): Observable<{ success: boolean; message: string }> {
    return from(this._registerAsync(email, password, name));
   }

  getSession(): Promise<Session | null> {
    return this.client.auth.getSession().then(({ data }) => data.session);
  }

  logout(): Promise<void> {
    return this.client.auth.signOut().then(() => {});
  }

  sendMessage(message: string): Observable<{ success: boolean; message: string }> {
    return from(this._sendMessage(message));
  }

  onNewMessages(callback: (payload: any) => void) {
    return this.client
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, payload => {
        callback(payload.new);
      })
      .subscribe();
  }

  async getRecentMessages() {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading messages:', error.message);
      return [];
    }

    return data;
  }

  async getUserId() {
    const userIdAuth = await this.client.auth.getUser().then(({ data }) => data.user?.id);
    if (!userIdAuth) return null;

    const userId = await this.client.from('user_info').select('id').eq('auth_id', userIdAuth).then(({ data }) => data ? data[0]?.id : null);
    return userId;
  }

  createSurvey(surveyData: any): Observable<{ success: boolean; message: string }> {
    return from(this._createSurvey(surveyData));
  }

  surveyAlreadyTaken(): Observable<{ success: boolean; message: string }> {
    return from(this._surveyAlreadyTaken());
  }

   private async _registerAsync(email: string, password: string, name: string) {
    try {
      const response = await this.client.auth.signUp({ email: email, password: password });
      if (response.error) return { success: false, message: response.error.message};
      if (response.data.user?.identities?.length === 0) return { success: false, message: "User already exists" };

      var insertResponse = await this.client.from('user_info').insert({ name: name, auth_id: response.data.user?.id})

      if (insertResponse.error) return {success: false, message: insertResponse?.error?.message};

      return {success: true, message: "OK"};
    } catch (ex) {
      return {success: false, message: "Error"};
    }
   }

   private async _isValidLogin(email: string, password: string) {
    try {
      const response = await this.client.auth.signInWithPassword( {email: email, password: password});
      if (response.error) return { success: false, message: response.error.message};

      return {success: true, message: "OK"};
    } catch {
      return {success: false, message: "Error"};
   }
  }

  private async _sendMessage(message: string) {
    try {
      const userIdAuth = await this.client.auth.getUser().then(({ data }) => data.user?.id);
      if (!userIdAuth) return { success: false, message: "User not found"};

      const userName = await this.client.from('user_info').select('name').eq('auth_id', userIdAuth).then(({ data }) => data ? data[0]?.name : null);
      const userId = await this.client.from('user_info').select('id').eq('auth_id', userIdAuth).then(({ data }) => data ? data[0]?.id : null);
      if (!userId) return { success: false, message: "User ID not found"};
      if (!userName) return { success: false, message: "User name not found"};

      const response = await this.client.from('messages').insert({ content: message, user_id: userId, user_name: userName });

      if (response.error) return { success: false, message: response.error.message};
      return { success: true, message: "OK" };

    } catch (error) {
      return {success: false, message: "Error"};
    }
  }

  private async _createSurvey(surveyData: any) {
    try {
      const userId = await this.getUserId();
      if (!userId) return { success: false, message: "User ID not found"};

      const response = await this.client.from('survey').insert({ ...surveyData, user_id: userId });

      if (response.error) return { success: false, message: response.error.message};
      return { success: true, message: "OK" };

    } catch (error) {
      return {success: false, message: "Error"};
    }
  }

  private async _surveyAlreadyTaken() {
    try {
      const userId = await this.getUserId();
      if (!userId) return { success: false, message: "User ID not found"};

      const response = await this.client.from('survey').select('*').eq('user_id', userId);

      if (response.error) return { success: false, message: response.error.message};
      if (response.data?.length === 0) return { success: false, message: "Survey not found"};
      return { success: true, message: "OK" };

    } catch (error) {
      return {success: false, message: "Error"};
    }
  }
}
