# weapp-date
- 传值参数:
    - dateTypes:可选，传入的tab选项，没有传空数组[]
    {
        type:Array,
        默认值:[{label:"年",value:"year"},{label:"季度",value:"season"},{label:"月",value:"month"},{label:"周",value:"week"},{label:"日",value:"date"}]
        label:页面展示的tab值，可自定义值
        value:传给时间插件的选择器类型，可选值有:"year","season","month","week","date","range";当value为"range"时是一个范围选择器，目前只能选择两个日期；
    },
    - defaultItem:可选，选择器类型，可选值："year","season","month","week","date","range"
    {
        type:String,
        默认值:"date"
    },
    - defaultTime:时间默认值，默认为空
    {
        type:Object|String,
        传入String,则会给defaultItem附上默认值
        传入Object，格式如下，暂不支持给range类型添加默认值
        defaultTime:{year:"2020",month:"2021-10",week:"2023-09-第1周",date:"2021-09-20",season:"2021-第三季度"}
        year:yyyy
        month:yyyy-MM|yyyy-M
        date:yyyy-MM-dd
        week:"yyyy-MM-第N周"
        season:"yyyy-第N季度"
    }
- 绑定函数：
    - getValue
    返回一个Object类型参数 value:所选值，
    {
        detail: {value: "2023-09-第5周", startTime: "2023-09-24", endTime: "2023-09-30"}
    }
