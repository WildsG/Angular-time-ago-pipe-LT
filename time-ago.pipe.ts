import {
  Pipe,
  PipeTransform,
  NgZone,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
@Pipe({
  name: 'timeAgo',
  pure: false,
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {

  private timer: number;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}
  transform(value: string) {
    this.removeTimer();
    const d = new Date(value);
    const now = new Date();
    const seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
    const timeToUpdate = Number.isNaN(seconds)
      ? 1000
      : this.getSecondsUntilUpdate(seconds) * 1000;
    this.timer = this.ngZone.runOutsideAngular(() => {
      if (typeof window !== 'undefined') {
        return window.setTimeout(() => {
          this.ngZone.run(() => this.changeDetectorRef.markForCheck());
        }, timeToUpdate);
      }
      return null;
    });
    const minutes = Math.round(Math.abs(seconds / 60));
    const hours = Math.round(Math.abs(minutes / 60));
    const days = Math.round(Math.abs(hours / 24));
    const months = Math.round(Math.abs(days / 30.416));
    const years = Math.round(Math.abs(days / 365));
    if (Number.isNaN(seconds)) {
      return '';
    } else if (seconds <= 45) {
      return 'prieš kelias sekundes';
    } else if (seconds <= 90) {
      return 'prieš minutę';
    } else if (minutes <= 45) {
      return 'prieš ' + minutes + ' minu' + this.getWordEnding(minutes, Format.minutes);
    } else if (minutes <= 90) {
      return 'prieš valandą';
    } else if (hours <= 22) {
      return 'prieš ' + hours + ' valand' + this.getWordEnding(hours, Format.hours);
    } else if (hours <= 36) {
      return 'prieš dieną';
    } else if (days <= 25) {
      return 'prieš ' + days + ' dien' + this.getWordEnding(days, Format.days);
    } else if (days <= 45) {
      return 'prieš mėnesį';
    } else if (days <= 345) {
      return 'prieš ' + days + ' mėnes' + this.getWordEnding(months, Format.months);
    } else if (days <= 545) {
      return 'a year ago';
    } else {
      return years + ' years ago';
    }
  }
  ngOnDestroy(): void {
    this.removeTimer();
  }
  private removeTimer() {
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }
  private getWordEnding(num: number, format: Format) {
    const array = [...num + ''].map(n => + n);
    if (array[array.length - 1] === 0 || (array[array.length - 1] <= 9  && num >= 10 && num <= 20)) {
      switch (format) {
        case Format.minutes:
          return 'čių';
        case Format.hours:
        case Format.days:
          return 'ų';
        case Format.months:
          return 'ių';

      }
    } else if (array[array.length - 1] === 1) {
      switch (format) {
        case Format.minutes:
          return 'tę';
        case Format.hours:
        case Format.days:
          return 'ą';
        case Format.months:
          return 'į';
      }
    } else {
      switch (format) {
        case Format.minutes:
          return 'tes';
        case Format.hours:
        case Format.days:
          return 'as';
        case Format.months:
          return 'ius';
      }
    }
  }

  private getSecondsUntilUpdate(seconds: number) {
    const min = 60;
    const hr = min * 60;
    const day = hr * 24;
    if (seconds < min) {
      // less than 1 min, update every 2 secs
      return 2;
    } else if (seconds < hr) {
      // less than an hour, update every 30 secs
      return 30;
    } else if (seconds < day) {
      // less then a day, update every 5 mins
      return 300;
    } else {
      // update every hour
      return 3600;
    }
  }
}

enum Format {
  minutes,
  hours,
  days,
  months
}
