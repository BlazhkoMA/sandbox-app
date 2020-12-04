<!--todo 1. Сделать переключение по дням -->
<!--todo 2. 1. получение рабочих дней преподавателя -->
<!--todo 3. 2. получение зарезервированных дней у преподавателя -->
<!--todo 4. Указание сегодняшнего времени -->
<template>
  <v-sheet class="calendar-width-test-container">
    <div class="counter">Prepaid Hours: {{computePrepaidHours}}</div>
    <div class="calendar">
      <div class="calendar-day-head">
        <div class="calendar-day-title" v-for="(day) in daysArray" v-bind:class="{selected: day.selected}"><span>{{ day.title }} {{ day.dayNumber }}</span></div>
      </div>
      <div class="calendar-day-body">
        <div v-for="(day, dayId) in daysArray" class="calendar-day">
          <div class="calendar-time" v-for="(time, timeId) in day.value" >
            <div class="calendar-time-row" v-if="time.vacant"  v-bind:class="{hidden: time.hidden}">
              <label class="calendar-time__label" >
                <input
                  class="calendar-time__checkbox"
                  type="checkbox"
                  :value="day.id + '-' + timeId"
                  v-model="schedule"
                  v-on:change="checkSelectedDay"
                >
                <span class="calendar-time__text" v-if="time.vacant">{{time.period}}</span>
                <span class="calendar-time__text calendar-time__text-hidden" v-else>{{time.period}}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="calendar-day-footer">
        <button class="calendar-day-footer-btn" v-on:click="saveDay">Save</button>
      </div>
    </div>
  </v-sheet>
</template>
<script>
import moment from "moment"
export default {
  name: 'CalendarCheckout',
  root: 'vue-calendar-checkout',
  async asyncData({$axios}){
    return await $axios.$get('db.json')
      .then((reserved) => {
        reserved = reserved['answersTimeZone']
        return { reserved }
      })
  },
  computed: {
    computeCurrentDay: function () {
      return this.dateNow.getDay()
    },
    computeCurrentWeek: function () {
      const start = this.computeCurrentDay
      let newDateArrayIndex = this.days.findIndex((item, idx) => {
        if(item.id == start){
          return idx
        }
      })
      let newDateArray = this.days.slice(newDateArrayIndex).concat(this.days.slice(0, newDateArrayIndex))
      return newDateArray
    },
    computeWeek: function () {
      let array = []
      let oneDay = 1000*60*60*24
      for (let i = 0; i < 7; i++){
        array.push({
          title: moment(this.dateNow.getTime() + (oneDay*i)).format('dd'),
          dayNumber: moment(this.dateNow.getTime() + (oneDay*i)).format('D'),
        })
      }
      return array
    },
    reservedTimeZone: function () {
      let reserved = this.reserved
      const qDay = 7;
      const qPeriod = 48;
      const date = new Date()
      const offset = +date.getTimezoneOffset() / 30
      reserved = reserved.map(item => {
        let value = item.split('-')
        return [+value[0], +value[1]]
      })
      reserved = reserved.map(item => {
        if(item[1] - offset > qPeriod || item[1] - offset <= 0){
          if(item[1] - offset > qPeriod){
            item[0] = item[0] + 1 > qDay ? 1 : ++item[0]
            item[1] = (item[1] - offset) - qPeriod
          } else {
            item[0] = item[0] - 1 <= 0 ? 7 : --item[0]
            item[1] = qPeriod - (offset - item[1])
          }
        } else {
          item[1] = +item[1] - offset
        }
        return item.join('-')
      })
      return reserved
    },
    daysArray: function () {
      const array = {}
      const days = this.computeCurrentWeek
      const time = this.timePeriod
      let oneDay = 1000*60*60*24
      let reservedTimes = this.reservedTimeZone
      reservedTimes = reservedTimes.map(item => {
        let value = item.split('-')
        return [+value[0], +value[1]]
      })
      days.forEach((d, idx) => {
        array[idx] = {
          title: d.title,
          titleShort: moment(this.dateNow.getTime() + (oneDay * idx)).format('D'),
          dayNumber: moment(this.dateNow.getTime() + (oneDay * idx)).format('D'),
          dayCurrentDay: false,
          id: d.id,
          selected: false,
          value: {}
        }
        let flagSelected = false
        time.forEach(t => {
          let flag = reservedTimes.find((item, idx) => {return item[0] == d.id && item[1] == t.id})
          let vacant = false
          if(flag){
            vacant = true
            flagSelected = true
          }
          array[idx].value[t.id] = {
            period: t.period,
            vacant: vacant,
            hidden: false,
          }
        })
        if(flagSelected){
            array[idx].selected = true
        }
      })

      return array
    },
    timePeriod: function () {
      let idCounter = 1;
      let timeStart = 0;
      let timeFinish = 24;
      let timeObj = []
      for(let i = timeStart; i < timeFinish; i++){
        let period = i < 10 ? '0' + i + ':00' : i + ':00';
        const obj1 = {
          id: idCounter,
          period: period
        }
        idCounter++
        period = i < 10 ? '0' + i + ':30' : i + ':30';
        const obj2 = {
          id: idCounter,
          period: period
        }
        idCounter++
        timeObj.push(obj1, obj2)
      }

      return timeObj
    },
    answersValues: function () {
      return this.answers.push(...this.reservedTimeZone)
    },
    computePrepaidHours: function () {
          return this.prepaidHours - this.schedule.length
    }
  },
  data: () => ({
    dateNow: new Date(),
    days: [
      {id: 1, title: 'Monday'},
      {id: 2, title: 'Tuesday'},
      {id: 3, title: 'Wednesday'},
      {id: 4, title: 'Thursday'},
      {id: 5, title: 'Friday'},
      {id: 6, title: 'Saturday'},
      {id: 7, title: 'Sunday'}
    ],
    prepaidHours: 5,
    answers: [],
    daySelected: [],
    hiddenValue: [],
    schedule: []
  }),
  watch: {
    answers: (val, oldVal) => {
    }
  },
  methods: {
    saveDay: async function () {

    },
    checkSelectedDay: function (params) {

      if(this.computePrepaidHours >= 0){
        let splitArray = params.target.value.split('-')
        let nextValue = splitArray[0] + '-' + (+splitArray[1] + 2);
        let prevValue = splitArray[0] + '-' + (+splitArray[1] - 2);
        let checkPrev = this.schedule.findIndex(item => {
          return item === prevValue
        })
        let checkNext = this.schedule.findIndex(item => {
          return item === nextValue
        })
        let checked = params.target.checked
        for (const paramsKey in this.daysArray) {
          if(this.daysArray[paramsKey].id == splitArray[0]){
            if(checked){
              if(checkPrev === -1){
              this.daysArray[paramsKey].value[+splitArray[1] - 1].hidden = true
            }
              if(checkNext === -1){
                this.daysArray[paramsKey].value[+splitArray[1] + 1].hidden = true
              }
            } else {
              if(checkPrev === -1){
                this.daysArray[paramsKey].value[+splitArray[1] - 1].hidden = false
              }
              if(checkNext === -1){
                this.daysArray[paramsKey].value[+splitArray[1] + 1].hidden = false
              }
            }
          }
        }
      } else {
        params.target.checked = false
        this.schedule = this.schedule.slice(0,this.schedule.length - 1)
      }
    },
  },
  mounted() {
    console.log('Entry Values GMT:0', this.reserved)
    this.answersValues
  }
}
</script>

<style lang="scss">

.calendar-width-test-container{
  height: 470px;
  padding-bottom: 15px;
  overflow: hidden;
}
.calendar{
  height: 100%;
  overflow: hidden;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  border: 1px solid #CCC;
  background-color: #fff;
  padding-left: 20px;
  padding-right: 20px;
  font-family: "Roboto", sans-serif;
  position: relative;
  &-day{
    width: calc(100% / 7);
    display: flex;
    flex-direction: column;
    align-items: center;
    &-head{
      position: sticky;
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
    &-body{
      flex-grow: 1;
      overflow-y: scroll;
      display: flex;
      justify-content: space-between;
      &::-webkit-scrollbar-track
      {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
        border-radius: 6px;
        background-color: #F5F5F5;
      }
      &::-webkit-scrollbar
      {
        width: 6px;
        background-color: #F5F5F5;
      }
      &::-webkit-scrollbar-thumb
      {
        border-radius: 6px;
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
        background-color: #555;
      }
    }
    &-footer{
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 15px;
      padding-bottom: 15px;
      &-btn{
        width: 120px;
        height: 35px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        color: #333333;
        border: 1px solid #333333;
        outline: none;
        font-weight: 400;
        &:hover{
          background-color: #12747A;
          color: white;
          border: 1px solid #12747A;
        }
      }
    }
    &-title{
      width: calc(100% / 7);
      display: flex;
      justify-content: center;
      padding-top: 14px;
      span{
        display: block;
        position: relative;
        text-align: center;
        padding-bottom: 16px;
        color: #828282;
        font-size: 15px;
        font-weight: 400;

        &::after{
          content: '';
          position: absolute;
          left: 0px;
          bottom: 12px;
          width: 15px;
          height: 1px;
          background-color: #828282;
        }
      }
      &.selected{
        span{
          color: #12747A;
          font-weight: 600;
          &::after{
            background-color: #12747A;
          }
        }
      }
    }
  }
  &-time{
    display: flex;
    flex-direction: column;
    &-row{
      padding-top: 9px;
      padding-bottom: 9px;
      &.hidden{
        display: none;
      }
    }
    &__label{
      cursor: pointer;
      .calendar-time__checkbox:checked ~ .calendar-time__text{
        color: #333333;
        font-weight: 600;
        &:hover{
          color: #333333;
        }
      }
    }
    &__checkbox{
      display: none;
    }
    &__text{
      display: block;
      color: #828282;
      font-size: 14px;
      min-width: 50px;
      text-align: center;
      &:hover{
        color: #333333;
      }
      &-hidden{
        opacity: 0.4;
      }
    }
  }
}


</style>
