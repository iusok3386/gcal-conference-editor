import { Injectable } from '@angular/core';

// Declare the google object, which is provided by the Google Apps Script environment.
declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GasService {

  constructor() { }

  /**
   * Runs a server-side function in Google Apps Script.
   * @param functionName The name of the function to run in Code.gs.
   * @param args The arguments to pass to the function.
   * @returns A promise that resolves with the return value of the server-side function.
   */
  run<T>(functionName: string, ...args: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        [functionName](...args);
    });
  }
}
