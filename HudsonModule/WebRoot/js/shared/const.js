/** 常量文件------------------- */

// 模具加工常量对象
Module = {
	detaFormat : 'Y-m-d H:i',
	schedule : {
		initial : 0,// 新模
		alert : 1,// 修模
		design : 2
	// 设变
	},
	partState : [ '待安排', '已安排', '加工中', '暂停' ]
};

MSConfig = {
	// 全加工的代号
	craftAll : '11215',
	partStart : '20201',
	partFinish : '["20209","20210"]'
};