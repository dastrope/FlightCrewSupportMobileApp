import { Component } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page {
  /**
   * This page is responsible for handling the fuel checks and burn rate calculations
   */
  time: number = 0;
  totalFuel: number = 0;
  timer;
  countdown;
  public myForm: FormGroup;
  public myTracked: FormControl[] = [];
  public myTrackedNumbers: AbstractControl[] = [];
  private tankCount: number = 1;
  trackCount: number = 0;
  trackedFuel: number = 0;

  constructor(private formBuilder: FormBuilder){
    // angular constructor necessary to allow for dynamic fuel tank addition and removal
    this.myForm = formBuilder.group({
      tank1: ['', Validators.required]
    });
  }

  addControl(){
    // function to add a new fuel tank, starts out untracked
    this.tankCount++;
    this.myForm.addControl('tank' + this.tankCount, new FormControl('', Validators.required));
  }

  removeControl(control){
    // function to remove a specific fuel tank
    if (this.myTracked.includes(control)){
      const index = this.myTracked.indexOf(control, 0);
      if (index > -1) {
        this.myTracked.splice(index, 1);
        this.myTrackedNumbers.splice(index, 1);
        document.getElementById('tracking').innerHTML = 'Tracking: '
        + this.myTracked.length.toString() + ' tanks';
      }
    }
    this.myForm.removeControl(control.key);
  }

  trackControl(control){
    // function to track a specific fuel tank as one of the tanks that impacts burn rate
    if (!this.myTracked.includes(control)){
      this.myTracked.push(control);
      this.myTrackedNumbers.push(this.myForm.get(control.key));
      document.getElementById('tracking').innerHTML = 'Tracking: '
      + this.myTracked.length.toString() + ' tanks';
    } else{
      const index = this.myTracked.indexOf(control, 0);
      if (index > -1) {
        this.myTracked.splice(index, 1);
        this.myTrackedNumbers.splice(index, 1);
        document.getElementById('tracking').innerHTML = 'Tracking: '
        + this.myTracked.length.toString() + ' tanks';
      }
    }
  }

  startCheck() {
    // start the fuel check and begin tracking fuel amounts
    clearInterval(this.timer);
    let now = new Date();
    this.time = 0;
    // starts the timer to track time between check start and end
    this.timer = setInterval(() => {
      let newnow = new Date();
      this.time = Math.floor((newnow.valueOf() - now.valueOf()) / 1000);
      let minutes = Math.floor(this.time / 60);
      let seconds = this.time % 60;
      document.getElementById('elapsedtimer').innerHTML =
      'Time Elapsed Since Check Start: ' + minutes.toString() +
      ' minutes ' + seconds.toString() + ' seconds';
    }, 1000);
    this.totalFuel = 0;
    this.trackedFuel = 0;
    let i: number;
    for (i = 1; i <= this.tankCount; i++) {
      this.totalFuel += this.myForm.get('tank' + i).value;
    }
    for (let tank of this.myTrackedNumbers) {
      this.trackedFuel += tank.value;
    }
    let timeDisplay = new Date().toLocaleString();
    document.getElementById('startTime').innerHTML = 'Check Start Time: ' + timeDisplay;
    document.getElementById('initial').innerHTML = 'Initial Total Fuel: '
    + this.totalFuel.toString() + ' units';
    document.getElementById('trackedInitial').innerHTML = 'Initial Tracked Fuel: ' 
    + this.trackedFuel.toString() + ' units';
  }

  stopCheck() {
    // terminate the fuel check; make burn rate and reserve calculations, update elements
    clearInterval(this.countdown);
    clearInterval(this.timer);
    let finalTrackedFuel = 0;
    this.totalFuel = 0;
    let i: number;
    // add up all the tanks to get totals for tracked and untracked fuel amounts
    for (let tank of this.myTrackedNumbers){
      finalTrackedFuel += tank.value;
    }
    for (i = 1; i <= this.tankCount; i++) {
      this.totalFuel += this.myForm.get('tank' + i).value;
    }
    // start calculating reserve fuel amounts and update html elements
    let difference = this.trackedFuel - finalTrackedFuel;
    let burnRate = difference / this.time;
    let final = new Date();
    let reserve = final.valueOf() + (this.totalFuel / burnRate*1000);
    let burnoutTime = new Date(reserve);
    let burnoutTime20 = new Date(reserve - 1200000);
    let burnoutTime30 = new Date(reserve - 1800000);
    let timeDisplay = final.toLocaleString();
    document.getElementById('endTime').innerHTML = 'Check End Time: ' + timeDisplay;
    document.getElementById('final').innerHTML = 'Final Total Fuel: ' +
    this.totalFuel.toString() + ' units';
    document.getElementById('burnrate').innerHTML = 'Burnrate (from tracked tanks only): ' +
    (burnRate * 3600).toPrecision(5) + ' units/hour';
    document.getElementById('trackedFinal').innerHTML = 'Final Tracked Fuel: ' +
    + finalTrackedFuel.toString() + ' units';

    // Update the count down every 1 second
    this.countdown = setInterval(function() {
      let now = new Date().valueOf();
      let timeInMillis = reserve-now;
      let TTB = new Date(timeInMillis).valueOf();
      let TTB20 = new Date(timeInMillis - 1200000).valueOf();
      let TTB30 = new Date(timeInMillis - 1800000).valueOf();

      // Get todays date and time
      // let now = new Date().getTime();

      // Find the distance between now and the count down date

      // Time calculations for days, hours, minutes and seconds
      let days = Math.floor(TTB / (1000 * 60 * 60 * 24));
      let hours = Math.floor((TTB % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((TTB % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((TTB % (1000 * 60)) / 1000);

      let days20 = Math.floor(TTB20 / (1000 * 60 * 60 * 24));
      let hours20 = Math.floor((TTB20 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes20 = Math.floor((TTB20 % (1000 * 60 * 60)) / (1000 * 60));
      let seconds20 = Math.floor((TTB20 % (1000 * 60)) / 1000);

      let days30 = Math.floor(TTB30 / (1000 * 60 * 60 * 24));
      let hours30 = Math.floor((TTB30 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes30 = Math.floor((TTB30 % (1000 * 60 * 60)) / (1000 * 60));
      let seconds30 = Math.floor((TTB30 % (1000 * 60)) / 1000);

      // Display the results in the respective elements
      document.getElementById('timer').innerHTML = 'Time to Burnout: ' + days + 'd '
      + hours + 'h ' + minutes + 'm ' + seconds + 's : ' + burnoutTime.toLocaleString();
      document.getElementById('timer20').innerHTML = '20 Minute Reserve: ' + days20 + 'd '
      + hours20 + 'h ' + minutes20 + 'm ' + seconds20 + 's : '
      + burnoutTime20.toLocaleString();
      document.getElementById('timer30').innerHTML = '30 Minute Reserve: ' + days30 + 'd '
      + hours30 + 'h ' + minutes30 + 'm ' + seconds30 + 's : '
      + burnoutTime30.toLocaleString();

      // If the count down is finished, write some text 
      if (reserve < 0 || this.timer == true) {
        clearInterval(this.countdown);
        document.getElementById("timer").innerHTML = "EXPIRED";
      }
    }, 1000);
  }
}
