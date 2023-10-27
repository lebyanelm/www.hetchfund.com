import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit, AfterViewInit {
  @Input() src: string;
  @ViewChild('VideoElement') videoElement: ElementRef<HTMLVideoElement>;
  @ViewChild('PausePlayButton') pausePlayButton: ElementRef<HTMLVideoElement>;
  @ViewChild('ProgressContainer') progressContainer: ElementRef<HTMLDivElement>;
  @ViewChild('HoverPointElement') hoverPointElement: ElementRef<HTMLDivElement>;

  // Video play progress
  currentProgress = 0;
  currentHoverPoint = 0;

  isPaused = true;
  isButtonsVisible = true;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    const totalSeekWidth =
      this.progressContainer.nativeElement.getClientRects()[0]?.width || 0;

    // When a mouse hovers/seeks over progressbar
    this.progressContainer.nativeElement.onmousemove = (event) => {
      const mousePoint = event.offsetX;
      this.currentHoverPoint = (mousePoint / totalSeekWidth) * 100;
    };

    this.progressContainer.nativeElement.onclick = (event) => {
      const mousePoint = event.offsetX;
      this.currentProgress = (mousePoint / totalSeekWidth) * 100;

      this.videoElement.nativeElement.currentTime =
        this.videoElement.nativeElement.duration * (this.currentProgress / 100);
    };

    this.progressContainer.nativeElement.onmouseleave = () =>
      (this.currentHoverPoint = 0);

    this.videoElement.nativeElement.ontimeupdate = () => {
      this.currentProgress =
        (this.videoElement.nativeElement.currentTime /
          this.videoElement.nativeElement.duration) *
        100;
    };
  }

  toFullscreen() {
    this.videoElement.nativeElement.requestFullscreen();
  }

  toggle() {
    this.videoElement.nativeElement.volume = 1;
    if (this.videoElement.nativeElement.paused) {
      this.videoElement.nativeElement.play();
      this.isButtonsVisible = false;
      this.isPaused = false;
    } else {
      this.videoElement.nativeElement.pause();
      this.isButtonsVisible = true;
      this.isPaused = true;
    }
  }
}
