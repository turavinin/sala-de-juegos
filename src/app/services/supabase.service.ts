import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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


   private async _registerAsync(email: string, password: string, name: string) {
    try {
      if (await this._emailExists(email)) { return { success: false, message: "User already exists" }; }

      const response = await this.client.auth.signUp({ email: email, password: password });
      if (response.error) return { success: false, message: response.error.message};

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
      console.log("login response: ", response);
      if (response.error) return { success: false, message: response.error.message};

      return {success: true, message: "OK"};
    } catch {
      return {success: false, message: "Error"};
   }
  }

  private async _emailExists(email: string) {
    try {
      const response = await this.client.from('users').select('email').eq('email', email);

      if (response.status === 404) return false;
      return true;
    } catch {
      return { success: false, message: "Error" };
    }
  }
}
