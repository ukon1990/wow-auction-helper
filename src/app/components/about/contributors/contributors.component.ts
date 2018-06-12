import { Component, OnInit } from '@angular/core';
import { GithubContributor } from '../../../models/github/github-contributor.model';
import { GithubService } from '../../../services/github.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'wah-contributors',
  templateUrl: './contributors.component.html',
  styleUrls: ['./contributors.component.scss']
})
export class ContributorsComponent {
  contributors = new Array<GithubContributor>();
  failed = false;

  constructor(private service: GithubService, private _sanitizer: DomSanitizer) {
    this.service.getContributors()
      .then((contributors =>
        this.contributors = contributors));
  }

  getIconStyle(url: string): SafeResourceUrl {
    return this._sanitizer.bypassSecurityTrustStyle(
      `url('${
        url
      }')`);
  }

}
