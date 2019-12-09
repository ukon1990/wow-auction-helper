import { Component, OnInit } from '@angular/core';
import { GithubService } from '../../services/github.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {GithubContributor} from '../../models/github/github-contributor.model';

@Component({
  selector: 'wah-contributors',
  templateUrl: './contributors.component.html',
  styleUrls: ['./contributors.component.scss']
})
export class ContributorsComponent {
  codeContributors = new Array<GithubContributor>();
  failed = false;

  constructor(private service: GithubService, private sanitizer: DomSanitizer) {
    this.service.getContributors()
      .then((contributors =>
        this.codeContributors = contributors));
  }

  getIconStyle(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustStyle(
      `url('${
        url
      }')`);
  }

}
