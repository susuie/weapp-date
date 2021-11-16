import * as dateA from "../date/date.js";
const datesInMonth = (year, month) => {
  const numOfDays = getDayCountOfMonth(year, month);
  const firstDay = new Date(year, month, 1);
  return range(numOfDays).map(n => nextDate(firstDay, n));
};

const clearDate = (date) => {
  return new Date(date.getFullYear(), date.getMonth());
};
const getMonthTimestamp= function(time) {
  if (typeof time === 'number' || typeof time === 'string') {
    return clearDate(new Date(time)).getTime();
  } else if (time instanceof Date) {
    return clearDate(time).getTime();
  } else {
    return NaN;
  }
};
const coerceTruthyValueToArray = function(val) {
  if (Array.isArray(val)) {
    return val;
  } else if (val) {
    return [val];
  } else {
    return [];
  }
};
Component({

    behaviors: [],
  
    properties: {
      selectMode:{
        type:String,
        value:'date'
      },
      wishView:{
        type:String,
        value:"date"
      },
    },
    
    data: {
        WEEKS:["日","一","二","三","四","五","六"],
        months:['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        year:new Date().getFullYear(),
        month:new Date().getMonth(),
        date:null,
        selectedDate:null,
        startYear:new Date().getFullYear(),
        yearLabel:"",
        rows:[[],[],[],[],[],[]],
        currentView:"date",
        showWeekNumber:false,
        startDate:new Date(),
        minDate:"1949-10-01",
        maxDate:"2099-10-01",
        monthRows:[[],[],[]],
        disabledDate:false,
        defaultTime:"08:00:00",
        isWeekActive:-1,
        season:-1,
        monthCurrent:-1,
        selectSeason:"",
        selectMonth:"",
        rangeDate:[],
        selectItem:""
    }, // 私有数据，可用于模板渲染
    lifetimes: {
      // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
      created:function(){
        if(!this.data.date){
          this.setData({date:new Date()})
        }
      },
      attached: function () {
        dateA.watch(this,{
          date:function(val){
            this.setData({month:val.getMonth()});  
            this.setData({year:val.getFullYear()});
            this.setData({startDate:dateA.getStartDateOfMonth(val.getFullYear(), val.getMonth())});
            this.setData({yearLabel:this.yearLabel()});
            this.setData({startYear:Math.floor(this.data.year / 10) * 10});  
            this.setData({isWeekActive:-1});         
            this.setData({rows:this.rows(this.data.selectedDate)});
            if(this.data.currentView==="season"){
              let year=this.data.selectSeason?this.data.selectSeason.split("-")[0]:"";
              if(Number(this.data.year)===Number(year)){
                this.setData({season:Number(this.data.selectSeason.split("-")[1])});
              }else{
                this.setData({season:-1});
              }
            }
            if(this.data.currentView==="month"){
              let year=this.data.selectMonth?this.data.selectMonth.split("-")[0]:"";
              if(Number(this.data.year)===Number(year)){
                this.setData({monthCurrent:Number(this.data.selectMonth.split("-")[1])});
              }else{
                this.setData({monthCurrent:-1});
              }
            }
          },
          selectedDate:function(val){
            this.setData({rows:this.rows(val)});
          },
          wishView:function(val){
            let value=val.split("|");    
            if(value[2]!==this.data.selectItem){
              this.wishDate(value[0],value[1]);
            }                                                             
            this.setData({currentView:value[0]}); 
            this.setData({selectItem:value[2]})                   
          },
          selectMode:function(val){
            this.setData({isWeekActive:-1});   
            this.setData({rows:this.rows(this.data.date,val)});
          },
        });
        let value=this.data.wishView.split("|");
        this.setData({currentView:value[0]}); 
        this.setData({startDate:dateA.getStartDateOfMonth(this.data.year, this.data.month)}) 
        this.setData({yearLabel:this.yearLabel()});
        this.setData({startYear:Math.floor(this.data.year / 10) * 10});
        this.setData({rows:this.rows()});
        this.setData({monthRows:this.monthRows()});
        this.wishDate(value[0],value[1]);
       },
      ready:function(){},
      moved: function () { },
      detached: function () { },
    },
  
    pageLifetimes: {
      // 组件所在页面的生命周期函数
      show: function () { },
      hide: function () { },
      resize: function () { },
    },
  
    methods: {
      getDateTimestamp: function(time) {
        if (typeof time === 'number' || typeof time === 'string') {
          return dateA.clearTime(new Date(time)).getTime();
        } else if (time instanceof Date) {
          return dateA.clearTime(time).getTime();
        } else {
          return NaN;
        }
      },
      cellMatchesDate(cell, date) {
        const value = new Date(date);
        return this.data.year === value.getFullYear() &&
          this.data.month === value.getMonth() &&
          Number(cell.text) === value.getDate();
      },
      wishDate(type,val){
        let date;
        let startTime="",endTime="";
        if(type==="date"){
          if(this.data.selectMode==="week"){
              let value=val.split("-");
              let day=value[0]?(value[2][1]-1)*7+1:1;
              date=value[0]?new Date(`${value[0]}-${value[1]}-${day>30?30:day}`.replace(/-/g, "/")):new Date();
              let nweek=date.getDay();
              startTime= new Date(date.getTime()-nweek*24*3600*1000);
              endTime=new Date(date.getTime()+(6-nweek)*24*3600*1000);
              this.triggerEvent("getContent", {content:val,type:"week",startTime:startTime,endTime:endTime,show:false});
          }else if(this.data.selectMode==="range"){
              date=val?new Date(val.split("~")[1].replace(/-/g, "/")):new Date();
          }else{
              date=val?new Date(val.replace(/-/g, "/")):new Date();
              this.triggerEvent("getContent", {content:val,type:"date",startTime:val,endTime:val,show:false});
          }             
          this.setData({selectedDate:date});
          this.setData({date:date});
        }else{
          if(type==="season"){
            let value=val.split("-");
            date=value[0]?new Date(value[0]):new Date();
            let ns="";
            switch(value[1][1]){
              case "一":ns=0;startTime="01-01";endTime="03-31";break;
              case "二":ns=1;startTime="04-01";endTime="06-30";break;
              case "三":ns=2;startTime="07-01";endTime="09-30";break;
              case "四":ns=3;startTime="10-01";endTime="12-31";break;
              default:ns="";
            }
            this.setData({selectSeason:ns?`${value[0]}-${ns}`:this.data.selectSeason});
            this.triggerEvent("getContent", {content:val,type:"season",startTime:`${value[0]}-${startTime}`,endTime:`${value[0]}-${endTime}`,show:false});
          }else{
            date=val?new Date(val):new Date();
            if(val&&type==="month"){
              let value=val.split("-");
              this.setData({selectMonth:value[1]?`${value[0]}-${Number(value[1])-1}`:this.data.selectMonth});
              startTime=value[1]?`${val}-01`:"";
              endTime=value[1]?`${val}-${dateA.getDayCountOfMonth(Number(value[0]), Number(value[1])-1)}`:"";
              this.triggerEvent("getContent", {content:val,type:"month",startTime:startTime,endTime:endTime,show:false});
            }else if(val&&type==="year"){
              this.triggerEvent("getContent", {content:val,type:"year",startTime:`${val}-01-01`,endTime:`${val}-12-31`,show:false});
            }
          }
          this.setData({date:date})
        }            
      },
      setShortcutDate(){
        let year=new Date().getFullYear();
        let month=new Date().getMonth();
        let sdate=dateA.modifyDate(this.data.date, year, month, new Date().getDate());
        this.setData({selectedDate:sdate});
        this.setData({date:sdate});
        let day=sdate.getDay();
        let startTime= new Date(sdate.getTime()-day*24*3600*1000);
        let endTime=new Date(sdate.getTime()+(6-day)*24*3600*1000);
        this.triggerEvent("getContent",{content:`${year}-${month+1>9?month+1:"0"+(month+1)}-第${this.data.isWeekActive+1}周`,startTime:startTime,endTime:endTime,type:"week",show:false});
      },
      showMonthPicker() {
        this.setData({currentView:'month'});
        this.setData({yearLabel:this.yearLabel()})
      },

      showYearPicker() {
        this.setData({currentView:"year"});
        this.setData({yearLabel:this.yearLabel()})
      },
      prevMonth() {
        this.setData({date:dateA.prevMonth(this.data.date)})
      },

      nextMonth() {
        this.setData({date:dateA.nextMonth(this.data.date)})
      },

      prevYear() {
        if (this.data.currentView === 'year') {
          this.setData({date:dateA.prevYear(this.data.date, 10)})
        } else {
          this.setData({date:dateA.prevYear(this.data.date)})
        }
      },

      nextYear() {
        if (this.data.currentView === 'year') {
          this.setData({date:dateA.nextYear(this.data.date, 10)});
        } else {
          this.setData({date:dateA.nextYear(this.data.date)});
        }
      },
      // 内部方法建议以下划线开头
      handleYearTableClick:function(event){
        const target = event.currentTarget;
        let type=this.data.wishView.split("|")[0];
        if(type==="season"){
          this.setData({currentView:"season"});                
        }else if(type!=="year"){
          this.setData({currentView:"month"});
        }else{
          this.triggerEvent("getContent", {content:target.dataset.year,type:"year",startTime:`${target.dataset.year}-01-01`,endTime:`${target.dataset.year}-12-31`,show:false});
        }     
        this.setData({date:dateA.changeYearMonthAndClampDate(this.data.date,target.dataset.year,this.data.month)}); 
      },
      handleMonthTableClick(event) {
        let target = event.currentTarget;
        if (this.hasClass(target, 'disabled')) return;
        const column = target.dataset.cell;
        const row = target.dataset.row;
        const month = row * 4 + column; 
        let type=this.data.wishView.split("|")[0];     
        if(type!=="month"){
          this.setData({currentView:"date"})
        }
        this.setData({selectMonth:`${this.data.year}-${month}`});
        this.setData({date:dateA.changeYearMonthAndClampDate(this.data.date,this.data.year,month)});
        //const newDate = this.getMonthOfCell(month);
        if (this.data.selectMode === 'range') {
          if (!this.rangeState.selecting) {
            //this.$emit('pick', {minDate: newDate, maxDate: null});
            this.rangeState.selecting = true;
          } else {
            // if (newDate >= this.minDate) {
            //   this.$emit('pick', {minDate: this.minDate, maxDate: newDate});
            // } else {
            //   this.$emit('pick', {minDate: newDate, maxDate: this.minDate});
            // }
            this.rangeState.selecting = false;
          }
        } else if(type=="month"){
          let startTime=`${this.data.year}-${this.data.month+1}-01`;
          let endTime=`${this.data.year}-${this.data.month+1}-${dateA.getDayCountOfMonth(this.data.year, this.data.month)}`
          this.triggerEvent('getContent', {content:`${this.data.year}-${month>8?(month+1):"0"+Number(month+1)}`,type:"month",startTime:startTime,endTime:endTime,show:false});
        }
      },
      handleDatePick(event) {
        let value = event.currentTarget;
        let month = this.data.month;
        if(value.dataset.type === "prev-month"){
            month--;
        }
        if(value.dataset.type === "next-month"){
          month++;
        }
        let sdate=dateA.modifyDate(this.data.date, this.data.year, month, value.dataset.text);
        if(this.data.selectMode!=="range"){
          this.setData({selectedDate:sdate});
        }else{
          this.setData({selectedDate:!Array.isArray(this.data.selectedDate)||this.data.selectedDate.length===2?[sdate]:[this.data.selectedDate[0],sdate]});
        }        
        if (this.data.selectMode === 'day') {
          let newDate = this.data.date
            ? dateA.modifyDate(this.data.date, this.data.getFullYear(), this.data.getMonth(), value.dataset.text)
            : dateA.modifyWithTimeString(value, this.data.defaultTime);
          // change default time while out of selectableRange
          if (!this.checkDateWithinRange(newDate)) {
            newDate = dateA.modifyDate(this.data.selectableRange[0][0], this.data.year, month, value.dataset.text);
          }
          this.data.date = newDate;
          this.emit(this.date, this.showTime);
        } else if (this.data.selectMode === 'week') {
          this.setData({date:dateA.modifyDate(this.data.date, this.data.year, month, value.dataset.text)});
          let time=new Date(this.data.year,month,value.dataset.text);
          let day=time.getDay();
          let startTime= new Date(time.getTime()-day*24*3600*1000);
          let endTime=new Date(time.getTime()+(6-day)*24*3600*1000);
          this.triggerEvent("getContent",{content:`${this.data.year}-${month+1>9?month+1:"0"+(month+1)}-第${this.data.isWeekActive+1}周`,type:"week",startTime:startTime,endTime:endTime,show:false});
        } else if (this.data.selectMode === 'date') {
          this.setData({date:dateA.modifyDate(this.data.date, this.data.year, month, value.dataset.text)});
          this.triggerEvent("getContent",{content:this.data.date,type:"date",startTime:this.data.date,endTime:this.data.date,show:false});
          //this.emit(value, true); // set false to keep panel open
        }else if(this.data.selectMode === 'range'){
          this.setData({date:dateA.modifyDate(this.data.date, this.data.year, month, value.dataset.text)});
          if(this.data.selectedDate.length==2){
            this.triggerEvent("getContent",{content:this.data.selectedDate,type:"range",show:false});
          }          
        }
        
      },
      handleSeasonPick(event){
        let value = event.currentTarget;
        this.setData({season:Number(value.dataset.index)});
        this.setData({selectSeason:`${this.data.year}-${value.dataset.index}`});
        let startTime="",endTime="";
        switch(Number(value.dataset.index)){
          case 0:startTime=`${this.data.year}-01-01`;endTime=`${this.data.year}-03-31`;break;
          case 1:startTime=`${this.data.year}-04-01`;endTime=`${this.data.year}-06-30`;break;
          case 2:startTime=`${this.data.year}-07-01`;endTime=`${this.data.year}-09-30`;break;
          case 3:startTime=`${this.data.year}-10-01`;endTime=`${this.data.year}-12-31`;break;
          default: startTime="";endTime="";
        }
        this.triggerEvent("getContent",{content:`${this.data.year}-${value.dataset.text}`,type:"season",startTime:startTime,endTime:endTime,show:false})
      },
      rows(val,type) {
        // TODO: refactory rows / getCellClasses
        const date = new Date(this.data.year, this.data.month, 1);
        let day = dateA.getFirstDayOfMonth(date); // day of first day
        const dateCountOfMonth = dateA.getDayCountOfMonth(date.getFullYear(), date.getMonth());
        const dateCountOfLastMonth = dateA.getDayCountOfMonth(date.getFullYear(), (date.getMonth() === 0 ? 11 : date.getMonth() - 1));

        //day = (day === 0 ? 7 : day);

        const offset = 0;
        const rows = [[],[],[],[],[],[]];
        let count = 1;
        const startDate = this.data.startDate;
        const disabledDate = this.data.disabledDate;
        const cellClassName = this.data.cellClassName;
        const selectType=type?type:this.data.selectMode;
        const selectedDate = selectType=== 'range' ? coerceTruthyValueToArray(this.data.date) : val?val.getDate():new Date().getDate() ;
        for (let i = 0; i < 6; i++) {
          const row = rows[i];

          if (this.data.showWeekNumber) {
            if (!row[0]) {
              row[0] = { type: 'week', text: dateA.getWeekNumber(dateA.nextDate(startDate, i * 7 + 1)) };
            }
          }

          for (let j = 0; j < 7; j++) {
            let cell = {};
            if (!cell) {
              cell = { row: i, column: j, type: 'normal', inRange: false, start: false, end: false };
            }
            cell.type = 'normal';
            const index = i * 7 + j;
            const time = dateA.nextDate(startDate, index - offset).getTime();
            cell.inRange = time >= this.getDateTimestamp(this.data.minDate.replace(/-/g, "/")) && time <= this.getDateTimestamp(this.data.maxDate.replace(/-/g, "/"));
            cell.start = this.data.minDate && time === this.getDateTimestamp(this.data.minDate.replace(/-/g, "/"));
            cell.end = this.data.maxDate && time === this.getDateTimestamp(this.data.maxDate.replace(/-/g, "/"));
            if(time==this.getDateTimestamp(new Date())){
              cell.type="today";
            }
            if (i >= 0 && i <= 1) {
              const numberOfDaysFromPreviousMonth = day + offset < 0 ? 7 + day + offset : day + offset;

              if (j + i * 7 >= numberOfDaysFromPreviousMonth) {
                cell.text = count++;
                if(this.cellMatchesDate(cell,val)){
                  cell.type="current"
                  if (selectType === 'week'){
                    this.setData({isWeekActive:i}); 
                  }                    
                }
              } else {
                cell.text = dateCountOfLastMonth - (numberOfDaysFromPreviousMonth - j % 7) + 1 + i * 7;
                cell.type = 'prev-month';
              }
            } else {
              if (count <= dateCountOfMonth) {
                cell.text = count++;
                if(this.cellMatchesDate(cell,val)){
                  if (selectType === 'week'){
                    this.setData({isWeekActive:i}); 
                  }                 
                  cell.type="current";               
                }
              } else {
                cell.text = count++ - dateCountOfMonth;
                cell.type = 'next-month';
              }
            }
            let cellDate = new Date(time);
            cell.disabled = typeof disabledDate === 'function' && dateA.disabledDate(cellDate);
            cell.customClass = typeof cellClassName === 'function' && dateA.cellClassName(cellDate);
            row.push(cell);
          }
        }
        return rows;
      },
      monthRows() {
        // TODO: refactory rows / getCellClasses
        const rows = this.data.monthRows;
        const disabledDate = this.data.disabledDate;
        const selectedDate = [];
        const now = getMonthTimestamp(new Date());

        for (let i = 0; i < 3; i++) {
          const row = rows[i];
          for (let j = 0; j < 4; j++) {
            let cell = {};
            if (!cell) {
              cell = { row: i, column: j, type: 'normal', inRange: false, start: false, end: false };
            }

            cell.type = 'normal';

            const index = i * 4 + j;
            const time = new Date(this.data.year, index).getTime();
            cell.inRange = time >= getMonthTimestamp(this.data.minDate.replace(/-/g, "/")) && time <= getMonthTimestamp(this.data.maxDate.replace(/-/g, "/"));
            cell.start = this.data.minDate && time === getMonthTimestamp(this.data.minDate.replace(/-/g, "/"));
            cell.end = this.data.maxDate && time === getMonthTimestamp(this.data.maxDate.replace(/-/g, "/"));
            const isToday = time === now;

            if (isToday) {
              cell.type = 'today';
            }
            cell.text = index;
            let cellDate = new Date(time);
            cell.disabled = typeof disabledDate === 'function' && disabledDate(cellDate);

            row.push(cell);
          }
        }
        return rows;
      },
      yearLabel() {
        const yearTranslation = "年";
        if (this.data.currentView === 'year') {
          const startYear = Math.floor(this.data.year / 10) * 10;
          if (yearTranslation) {
            return startYear + ' ' + yearTranslation + ' - ' + (startYear + 9) + ' ' + yearTranslation;
          }
          return startYear + ' - ' + (startYear + 9);
        }
        return this.data.year + ' ' + yearTranslation;
      },
      getCellStyle:function(value){       
        return value === this.data.year ? "current" : ""
      },
      hasClass(el, cls) {
        if (!el || !cls) return false;
        if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
        if (el.classList) {
          return el.classList.contains(cls);
        } else {
          return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
        }
      }
    }
  
  })
   