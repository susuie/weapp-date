import {watch} from "../date/date.js";
Component({

    behaviors: [],
  
    properties: {
      dateTypes:{
        type:Array,
        value:[{label:"年",value:"year"},{label:"季度",value:"season"},{label:"月",value:"month"},{label:"周",value:"week"},{label:"日",value:"date"}]
      },
      defaultItem:{
        type:String,
        value:"date"
      },
      defaultTime:{
          type:Object|String,
      }
    },
    
    data: {
        showPick:false,
        valueDate:"",
        wishView:"year",
        selectMode:"date",
        selectItem:"year",
        select:{year:"",season:"",month:"",week:"",date:"",range:""},
        options:[]
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        created:function(){
            
        },
        attached: function () {
          watch(this,{
            dateTypes:function(val){
                this.setData({options:val});        
            },
            defaultTime:function(val){
                if(typeof(val)==="string"){
                    let date={};
                    date[this.data.defaultItem]=val;
                    this.setData({select:{...this.data.select,...date}});
                }else{
                  this.setData({select:{...this.data.select,...val}});
                }
                this.setData({valueDate:this.data.select[this.data.selectItem]});
            },
            defaultItem:function(val){
                this.setData({selectItem:val});
                this.setData({wishView:val});
                this.setData({selectMode:val==="week"?"week":this.data.selectMode});
                this.setData({valueDate:this.data.select[this.data.selectItem]});
            }
          });
          this.setData({options:this.data.dateTypes});
          this.setData({selectItem:this.data.defaultItem});
          this.setData({wishView:this.data.defaultItem});
          this.setData({selectMode:this.data.defaultItem==="week"?"week":this.data.selectMode});
          if(typeof(this.data.defaultTime)==="string"){
              let date={};
              date[this.data.defaultItem]=this.data.defaultTime;
              this.setData({select:{...this.data.select,...date}});
          }else{
            this.setData({select:{...this.data.select,...this.data.defaultTime}});
          }
          this.setData({valueDate:this.data.select[this.data.selectItem]});
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
      methods:{
        changeShow:function(){
            this.setData({showPick:true})
        },
        changeTab:function(event){
            this.setData({showPick:false})
            let type=event.currentTarget.dataset.type;
            this.setData({valueDate:this.data.select[type]});
            if(type==="week"||type=="range"){
                this.setData({wishView:"date"});
                this.setData({selectMode:type});
            }else{
                this.setData({wishView:type});
                this.setData({selectMode:"date"});
            }
            this.setData({selectItem:type});       
        },
        getContent:function(e){
            let value="";
            if(e.detail.type==="week"||e.detail.type==="season"||e.detail.type==="month"){
                value=e.detail.content;
            }else{
                let type={year:"yyyy",month:"yyyy-MM",date:"yyyy-MM-dd",range:"yyyy-MM-dd"};
                if(e.detail.type==="range"){
                    let startDate=this._formatDate(new Date(e.detail.content[0]+""),type[e.detail.type]);
                    let endDate=this._formatDate(new Date(e.detail.content[1]+""),type[e.detail.type]);
                    
                    value=startDate>endDate?endDate+"~"+startDate:startDate+"~"+endDate;
                }else{
                    value=this._formatDate(new Date(e.detail.content+""),type[e.detail.type]);
                }               
            }
            let startTime=e.detail.startTime;
            startTime=startTime?typeof(startTime)==="string"?startTime:this._formatDate(startTime):"";
            let endTime=e.detail.endTime;
            endTime=endTime?typeof(endTime)==="string"?endTime:this._formatDate(endTime):"";
            this.setData({valueDate:value});
            let s={};s[e.detail.type]=value;
            this.setData({select:{...this.data.select,...s}})
            this.setData({showPick:e.detail.show});
            this.setData({startTime:startTime});
            this.setData({endTime:endTime});
            this.triggerEvent("getValue",{value:value,startTime:startTime,endTime:endTime});
        },
        _formatDate: function(date,type){
            type=type?type:"yyyy-MM-dd";
            let year = date.getFullYear();
            if(type==="yyyy"){
                return year;
            }
            let month = type.indexOf("MM")>=0?this.getTwoDate(date.getMonth()+1):date.getMonth()+1;
            if(type==="yyyy-MM"||type==="yyyy-M"){
                return `${year}-${month}`;
            }
            let day = type.indexOf("dd")>=0?this.getTwoDate(date.getDate()):date.getDate()+1;
            return `${year}-${month}-${day}`
        },
        getTwoDate: function(num){
            return num>9?num:'0'+num;
        }
      }
})
