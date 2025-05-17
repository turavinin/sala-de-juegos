import { Injectable } from '@angular/core';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { from, Observable } from 'rxjs';
import { N } from '@angular/cdk/keycodes';
import { Results } from '../models/results.model';

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

  saveGamePoints(points:number, game: string): Observable<{ success: boolean; message: string }>  {
    return from(this._saveUserPoints(points, game));
  }

  async getResults() {
    const userIdAuth = await this.client.auth.getUser().then(({ data }) => data.user?.id);
    return this.client
      .from('results')
      .select('*')
      .eq('auth_id', userIdAuth)
      .order('total_points', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading results:', error.message);
          return [];
        }
        return data;
      });
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

  async getUserAuthId() {
    const userIdAuth = await this.client.auth.getUser().then(({ data }) => data.user?.id);

    if (!userIdAuth) return null;
    return userIdAuth;
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

  private async _saveUserPoints(points: number, game: string) {
    const userAuthId = await this.getUserAuthId();
    if (!userAuthId) return { success: false, message: "User ID not found"};
    const userLastPointsData = await this.client.from('results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .eq('auth_id', userAuthId)
      .then(({ data }) => data ? data.map((item: any) => ({
      id: item.id,
      auth_id: item.auth_id,
      points: item.points,
      created_at: item.created_at,
      total_points: item.total_points,
      game: item.game,
      })) : null);

      console.log('userLastPointsData', userLastPointsData);

    let lastTotalPoints = 0;
    let userId = 0;
    let created_at = '';

    if (userLastPointsData && userLastPointsData.length > 0) {
      lastTotalPoints = userLastPointsData[0].total_points || 0;
      userId = userLastPointsData[0].id || 0;
      created_at = userLastPointsData[0].created_at || '';
    }

    const userPointsToSave: Results = {
      id: userId,
      created_at: created_at,
      auth_id: userAuthId,
      points: points,
      total_points: lastTotalPoints <= 0 ? points : lastTotalPoints + points,
      game: game
    }

    console.log('userPointsToSave', userPointsToSave);
    
    delete (userPointsToSave as any).id;
    delete (userPointsToSave as any).created_at;
    await this.client.from('results').insert(userPointsToSave).then(({ data, error }) => {
      if (error) return { success: false, message: error.message};
      return { success: true, message: "OK" };
    });

    return { success: true, message: "OK" };
  }
}
