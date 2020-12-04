<template>
  <v-sheet class="calendar-width-test-container">
  <div class="calendar">
    <div class="calendar-day-head">
      <div class="calendar-day-title" v-for="(day) in computedDays" v-model="computedDays" v-bind:class="{selected: day.selected}"><span>{{ day.title }}</span></div>
    </div>
    <div class="calendar-day-body">
      <div v-for="(day, dayId) in computedDays" class="calendar-day">
        <div class="calendar-time" v-for="(time, timeId) in day.value" >
          <div class="calendar-time-row">
            <label class="calendar-time__label">
              <input
                class="calendar-time__checkbox"
                type="checkbox"
                :value="dayId + '-' + timeId"
                v-model="answers"
                v-on:change="checkSelectedDay"
              >
              <span class="calendar-time__text">{{time.period}}</span>
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
    computedDays: function () {
      let reserved = this.reservedTimeZone
      let daysArray = this.daysArray
      reserved = reserved.map(item => {
        return item.split('-')
      })
      reserved.forEach(item => {
        daysArray[item[0]].value[item[1]].vacant = false
        daysArray[item[0]].selected = true
      })
      return daysArray
    },
    daysArray: function () {
      const array = {}
      const days = this.days
      const time = this.timePeriod
      days.forEach((d) => {
        array[d.id] = {
          title: d.title,
          selected: false,
          value: {}
        }
        time.forEach(t => {
          array[d.id].value[t.id] = {
            period: t.period,
            vacant: true
          }
        })
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
  },
  data: () => ({
    days: [
      {id: 1, title: 'Monday'},
      {id: 2, title: 'Tuesday'},
      {id: 3, title: 'Wednesday'},
      {id: 4, title: 'Thursday'},
      {id: 5, title: 'Friday'},
      {id: 6, title: 'Saturday'},
      {id: 7, title: 'Sunday'}
    ],
    answers: [],
    daySelected: []
  }),
  watch: {
    answers: (val, oldVal) => {
    }
  },
  methods: {
     saveDay: async function () {
      let answersTimeZone = this.answers
      const qDay = 7;
      const qPeriod = 48;
      const date = new Date()
      const offset = +(-date.getTimezoneOffset() / 30)
      console.log(`Current Data GMT:${-(date.getTimezoneOffset()/60)}`, this.answers)
      answersTimeZone = answersTimeZone.map(item => {
        item = item.split('-')
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
      await this.$axios.$post('/api/db/index', {answersTimeZone})
       console.log(`Current Data GMT:0`,answersTimeZone)
      await this.$router.replace({ path: '/' })
    },
    checkSelectedDay: function () {
      let val = this.answers.map(item => {
        return item.split('-')
      })
      for (const key in this.computedDays) {
        this.computedDays[key].selected = false
      }
      val.forEach(item => {
        this.computedDays[item[0]].selected = true
      })
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
    }
  }
}


</style>
