import {Component} from '@angular/core';
import {ThemeUtil} from "../../core/utils/theme.util";

@Component({
  selector: 'wah-technology',
  template: `
      <mat-accordion>
          <mat-expansion-panel>
              <mat-expansion-panel-header>
                  <mat-panel-title>
                      The web client
                  </mat-panel-title>
              </mat-expansion-panel-header>
              <p>
                  The client is hosted in an AWS S3 bucket.
              </p>
              <mat-card class="mb-3"  [ngStyle]="{backgroundColor: theme.primaryColorCode}">
                  <mat-card-header>
                      <mat-card-title>Framework</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                      <mat-card>
                          <mat-card-header>
                              <mat-card-title>
                                  <a href="https://angular.io/" target="_blank">Angular</a>
                              </mat-card-title>
                          </mat-card-header>
                          <mat-card-content>
                              This is the framework the app is created with. I will usually try to keep it up to the
                              latest version as soon as they are out.
                          </mat-card-content>
                      </mat-card>
                  </mat-card-content>
              </mat-card>

              <mat-card class="mb-3" [ngStyle]="{backgroundColor: theme.primaryColorCode}">
                  <mat-card-header>
                      <mat-card-title>Storage</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                      <div class="row">
                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://angular.io/guide/service-worker-getting-started"
                                             target="_blank">Angular
                                              PWA</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      This basically is a ready to go setup for the service worker. It handles
                                      caching/storing
                                      re-usable data on the client. In order to reduce unnecessary data usage.
                                  </mat-card-content>
                              </mat-card>
                          </div>

                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://dexie.org/" target="_blank">Dexie</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      This basically is a ready to go setup for the service worker. It handles
                                      caching/storing
                                      re-usable data on the client. In order to reduce unnecessary data usage.
                                  </mat-card-content>
                              </mat-card>
                          </div>
                      </div>
                  </mat-card-content>
              </mat-card>

              <mat-card class="mb-3" [ngStyle]="{backgroundColor: theme.primaryColorCode}">
                  <mat-card-header>
                      <mat-card-title>UI and design</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                      <div class="row">
                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://material.angular.io/" target="_blank">Angular Material</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      Used for most of the UI components.
                                  </mat-card-content>
                              </mat-card>
                          </div>

                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://getbootstrap.com/" target="_blank">Bootstrap</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      This basically is a ready to go setup for the service worker. It handles
                                      caching/storing
                                      re-usable data on the client. In order to reduce unnecessary data usage.
                                  </mat-card-content>
                              </mat-card>
                          </div>
                      </div>
                  </mat-card-content>
              </mat-card>
              <mat-card class="mb-3" [ngStyle]="{backgroundColor: theme.primaryColorCode}">
                  <mat-card-header>
                      <mat-card-title>Charts</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                      <div class="row">
                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://www.highcharts.com" target="_blank">Highcharts</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      The charts are created with highcharts. They have lots of great charts.
                                  </mat-card-content>
                              </mat-card>
                          </div>
                      </div>
                  </mat-card-content>
              </mat-card>
          </mat-expansion-panel>

          <mat-expansion-panel>
              <mat-expansion-panel-header>
                  <mat-panel-title>
                      Server side
                  </mat-panel-title>
              </mat-expansion-panel-header>
              <p>
                  The backend comes in two parts. One that handles anything user related, and one that handles auction
                  data, items etc.
              </p>

              <mat-card class="mb-3" [ngStyle]="{backgroundColor: theme.primaryColorCode}">
                  <mat-card-header>
                      <mat-card-title>"Server"</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                      <p>
                          The current backend is written with NodeJS with TypeScript, and is created as AWS Lambdas.
                          This is the third iteration of the back-end. Originally it was in PHP, then NodeJS with ExpressJS, and
                          now it's moved to AWS Lambda.
                      </p>
                      <div class="row">
                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://aws.amazon.com/lambda/" target="_blank">AWS Lambda</a> &
                                          <a href="https://www.serverless.com/" target="_blank">Serverless</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      Instead of a traditional backend, the app uses a serverless architecture(except for that one RDS database).
                                      All the code is written using AWS Lambda. This allows for potentially unlimited scaling(with support for throttling).
                                      This also allows me to not host one or more virtual machines, as I only pay for what is used and not for
                                      some server sitting idle while waiting to process auction data or for a user to interact with it.

                                      The framework that is used for the job is <a href="https://www.serverless.com/" target="_blank">Serverless</a>.
                                  </mat-card-content>
                              </mat-card>
                          </div>
                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://aws.amazon.com/cloudwatch/" target="_blank">AWS CloudWatch</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      In order to trigger most of the processes that keepts the service going.
                                      I'm using CloudWatch to keep track of logs and triggering events(auction data update etc).
                                  </mat-card-content>
                              </mat-card>
                          </div>
                      </div>
                  </mat-card-content>
              </mat-card>
              <mat-card class="mb-3" [ngStyle]="{backgroundColor: theme.primaryColorCode}">
                  <mat-card-header>
                      <mat-card-title>Login and settings sync</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                      <div class="row">
                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://aws.amazon.com/cognito/" target="_blank">AWS Cognito</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      Handles user login and sessions. The front-end uses AWS amplify to communicate with it.
                                  </mat-card-content>
                              </mat-card>
                          </div>
                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://aws.amazon.com/appsync/" target="_blank">AWS AppSync</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      Handles user settings and syncronizes them between devices and browsers.
                                  </mat-card-content>
                              </mat-card>
                          </div>
                      </div>
                  </mat-card-content>
              </mat-card>

              <mat-card class="mb-3" [ngStyle]="{backgroundColor: theme.primaryColorCode}">
                  <mat-card-header>
                      <mat-card-title>Storage</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                      <div class="row">
                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://mariadb.com" target="_blank">MariaDB(RDS)</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      The item price history is stored in a RDS database, as that is what makes sense for this kind of data.
                                      It is only the backend that adds data to this database, and the insertion of new price data is queued
                                      in order to not loose price history.

                                      The RDS database also stores, recipes, items etc. But the user will never get the data directly from
                                      here, but instead via AWS S3 as that is faster and also cheaper.
                                  </mat-card-content>
                              </mat-card>
                          </div>
                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://aws.amazon.com/dynamodb/" target="_blank">DynamoDB(NoSQL)</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      Is used for keeping track of when auction houses last were updated, and user data.
                                      I am using it for this, as it is serverless, fast, cheap, and will not cause issues with too many
                                      concurrent connections.
                                  </mat-card-content>
                              </mat-card>
                          </div>
                          <div class="col mb-3">
                              <mat-card>
                                  <mat-card-header>
                                      <mat-card-title>
                                          <a href="https://aws.amazon.com/s3/" target="_blank">AWS Simple Storage Solution (S3)</a>
                                      </mat-card-title>
                                  </mat-card-header>
                                  <mat-card-content>
                                      Is used to store any static data. Items, professions, the client, auction data, tsm data etc. AWS S3,
                                      is really fast and also scales really well.
                                      Raw auction data is stored for 14 days. The app also uses to store queued item price history queries,
                                      and once a query is processed it's deleted from S3.
                                  </mat-card-content>
                              </mat-card>
                          </div>
                      </div>
                  </mat-card-content>
              </mat-card>
          </mat-expansion-panel>

          <mat-expansion-panel>
              <mat-expansion-panel-header>
                  May I see the code?
              </mat-expansion-panel-header>
              <p>
                  All the code for the client is available on
                  <a href="https://github.com/ukon1990/wow-auction-helper" target="_blank">GitHub</a>.
              </p>
              <p>
                  Both the front-end and back-end is available in the same repository.
              </p>
          </mat-expansion-panel>

          <mat-expansion-panel>
              <mat-expansion-panel-header>
                  Where can I report bugs?
              </mat-expansion-panel-header>
              <p>
                  If you find any bugs you wish to report, do feel free to
                  message me on Discord (I'm ukon1990 on the woweconomy channel)
                  or Reddit under the same username.
              </p>
          </mat-expansion-panel>
      </mat-accordion>
  `
})
export class TechnologyComponent {
  theme = ThemeUtil.current;
}
