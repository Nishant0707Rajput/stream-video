import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import videojs from 'video.js';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent {
  title = 'front-end';
  public video!: HTMLVideoElement;
  public player: any;

  constructor(
    private ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
  }
  videoLink =
    "http://localhost:3000/uploads/course/2e76ee89-31db-4328-8e8f-67ddc5d59b19/index.m3u8";
  options = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: this.videoLink,
        type: "application/x-mpegURL",
      },
    ],
  };
  ngOnInit() {
  }

  ngAfterViewInit() {
    this.player = videojs('HTML5Video', this.options, function () {
      console.log('We are ready!');
      this.play();
    });
  }
}
