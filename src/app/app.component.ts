import { Component } from '@angular/core';
import { AuctionService } from './services/auctions';
import { user } from './utils/globals';
import { IUser } from './utils/interfaces';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [AuctionService]
})
export class AppComponent {
    // http://realfavicongenerator.net/
    private title = 'WAH';
    private lastModified: number;
    private timeSinceLastModified: number;
    private oldTimeDiff: number;
    private date: Date;

    u: IUser = new IUser();

    constructor(private auctionService: AuctionService) { this.u = user; }

    ngOnInit() {
        this.date = new Date();
        if (this.isRealmSet()) {
            this.u.region = localStorage.getItem('region');
            this.u.realm = localStorage.getItem('realm');
            this.u.character = localStorage.getItem('character');
            this.checkForUpdate();
        }
        setInterval(() => this.setTimeSinceLastModified(), 1000);
        setInterval(() => this.checkForUpdate(), 60000);
    }

    setTimeSinceLastModified() {
        this.date = new Date();
        let updateTime = new Date(this.lastModified).getMinutes(),
            currentTime = this.date.getMinutes(),
            oldTime = this.timeSinceLastModified;
        // Checking if there is a new update available
        if (this.timeDiff(updateTime, currentTime) < this.oldTimeDiff) {
            this.auctionService.getAuctions();
        }

        this.timeSinceLastModified = this.timeDiff(updateTime, currentTime);
        this.oldTimeDiff = this.timeDiff(updateTime, currentTime);

    }

    timeDiff(updateTime, currentTime) {
        return (updateTime > currentTime ?
            (60 - updateTime + currentTime) : currentTime - updateTime);
    }

    exists(value): boolean {
        return value !== null && value !== undefined && value.length > 0;
    }

    isRealmSet(): boolean {
        return this.exists(localStorage.getItem('realm')) &&
            this.exists(localStorage.getItem('region'));
    }

    checkForUpdate() {
        if (this.isRealmSet()) {
            this.auctionService.getLastUpdated()
                .subscribe(r => this.lastModified = r['lastModified']);
        }
    }
}
