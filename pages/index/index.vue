<template>
	<view class="content">
		<view class="title">
			<u--text type="primary" :text="title" class="title" bold="true" size="32"></u--text>
		</view>
		<u-gap height="30" bgColor="#bbb"></u-gap>
		<view class="select_input">
			<u-search placeholder="输入你想搜索的日记标题噢~" v-model="selectValue" @search="select" :show-action="false">
			</u-search>
		</view>
		<u-gap height="50" bgColor="#bbb"></u-gap>
		<view class="section">
			<view class="section_top" style="margin-bottom:20px">
				<view class="btn_left item" @click="openCalendar()">
					<u--image src="/static/clock.png" width="80" height="80"></u--image>
					<u--text text="时间搜索器"></u--text>
				</view>
				<u-line direction="col" color="1296db" length="160rpx"></u-line>
				<view class="btn_right item" @click="openWrite()">
					<u--image src="/static/write.png" width="80" height="80"></u--image>
					<u--text text="写日记"></u--text>
				</view>
			</view>
			<u-gap height="30" bgColor="#f8f8f8"></u-gap>
			<view class="" style="height: 700px;">
				<z-paging :fixed="false" height='100%' ref="paging" v-model="diaryData" @query="queryList" show-refresher-update-time="true">
						<view v-for="(item, index) in diaryData" :key="item.id">
							<view class="listItem" @click="changeDiary(item)">
								<view class="listTitle">
									<u--text :text="item.title" bold="true" size="21"></u--text>
									<u--text mode="date" :text="item.date" size="12"></u--text>
								</view>
								<view class="listContent">
									<u--text :text="item.content" lines="3"></u--text>
								</view>
							</view>
							<u-gap height="8" bgColor="#f8f8f8"></u-gap>
						</view>
				</z-paging>
			</view>
		</view>
		<u-popup :show="showpopup" mode="center" @close="close">
			<view class="popup">
				<u--form labelPosition="left" :model="model1" :rules="rules" ref="form1">
					<u-form-item label="标题" prop="diaryTitle" borderBottom ref="item1">
						<u--input placeholder="写下今天的心情吧" border="none" clearable v-model="model1.diaryTitle">
						</u--input>
					</u-form-item>
					<u-form-item label="内容" prop="diaryValue" borderBottom ref="item3">
						<u--textarea v-model="model1.diaryValue" height="250" border="none" autoHeight="true" count>
						</u--textarea>
					</u-form-item>
					<u-form-item label="日期" prop="diaryDate" borderBottom @click="showDate = true; hideKeyboard()"
						ref="item1">
						<u--input v-model="model1.diaryDate" disabled disabledColor="#ffffff" placeholder="请选择日期"
							border="none"></u--input>
						<u-icon slot="right" name="arrow-right"></u-icon>
					</u-form-item>
				</u--form>
				<u-button @click="writeDiary" type="primary" customStyle="margin-top: 50px">确定</u-button>
				<u-button v-if="flag===1" @click="deleteDiary(model1.diaryId)" type="error" text="删除"
					customStyle="margin-top: 10px"></u-button>
				<u-datetime-picker :show="showDate" :value="Date" mode="date" closeOnClickOverlay
					@confirm="diaryDateConfirm" @cancel="diaryDateClose" @close="diaryDateClose"></u-datetime-picker>
			</view>
		</u-popup>
		<u-toast ref="uToast"></u-toast>
		<u-calendar :show="showCalendar" @close="showCalendar = false" closeOnClickOverlay="true" title="选择搜索范围"
			mode="range" allowSameDay="true" @confirm="selectDiaryTime" :maxDate="CalendarTime.Today"
			:minDate="CalendarTime.lastDay"></u-calendar>
		<u-back-top :scroll-top="scrollTop" icon="arrow-up" top="200" bottom="150"></u-back-top>
	</view>
</template>

<script>
	import {
		getDiary
	} from '../../config/api.js'
	import {
		debounce
	} from '@/util/debounce.js'
	export default {
		data() {
			return {
				title: '小小日记簿',
				selectValue: '',
				diaryData: [],
				showpopup: false,
				showCalendar: false,
				model1: {
					diaryId: null,
					diaryTitle: '',
					diaryValue: '',
					diaryDate: ''
				},
				flag: 0,
				CalendarTime: {
					Today: uni.$u.timeFormat(new Date().getTime(), 'yyyy-mm-dd'),
					lastDay: uni.$u.timeFormat((new Date().getTime() - 30 * 24 * 3600 * 1000), 'yyyy-mm-dd')
				},
				Date: Number(new Date()),
				showDate: false,
				rules: {
					'diaryTitle': {
						type: 'string',
						required: true,
						message: '请填写标题',
						trigger: ['blur', 'change']
					},
					'diaryValue': {
						type: 'string',
						min: 1,
						required: true,
						message: '不低于3个字',
						trigger: ['change']
					},
					'diaryDate': {
						type: 'string',
						required: true,
						message: '请选择日期',
						trigger: ['change']
					},
				},
				userName: uni.getStorageSync('userInfo').nickName,
				scrollTop: 0,
				triggered: false,
				firstTime: '',
				endTime: ''
			}
		},
		onLoad() {
		},
		onShow() {
			this.userName = uni.getStorageSync('userInfo').nickName
			if (this.userName) {
				console.log(this.userName)
				this.$refs.paging.reload(true)
			}
		},
		methods: {
			select() {
				this.$refs.paging.reload(true)
			},
			queryList(pageNo, pageSize) {
				//这里的pageNo和pageSize会自动计算好，直接传给服务器即可
				//这里的请求只是演示，请替换成自己的项目的网络请求，请在网络请求回调中
				//通过this.$refs.paging.complete(请求回来的数组);将请求结果传给z-paging
				let userName = this.userName
				uni.request({
					url: `https://api.esick.work/wxapi/getDiary`,
					data: {
						userName: userName,
						title: this.selectValue,
						today: this.firstTime,
						lastday: this.endTime,
					},
					success: (res) => {
						this.$refs.paging.complete(res.data.results)
						this.firstTime = ''
						this.endTime = ''
					},
					fail: (err) => {
						console.log(err)
						this.$refs.paging.complete(false)
					}
				});
			},
			openWrite() {
				const userInfo = uni.getStorageSync('userInfo');
				if (!userInfo) {
					this.$refs.uToast.show({
						message: "请先登录噢~",
						complete() {
							uni.switchTab({
								url: '/pages/user/user'
							});
						}
					})
				} else {
					this.showpopup = true
				}
			},
			writeDiary: debounce(function() {
				this.$refs.form1.validate().then(res => {
					uni.$u.toast('校验通过')
					let userName = this.userName
					let url = ''
					if (this.flag === 1) {
						url = 'https://api.esick.work/wxapi/updateDiary'

					} else {
						url = 'https://api.esick.work/wxapi/addDiary'
					}
					uni.request({
						url: url,
						method: 'POST',
						data: {
							userName: userName,
							title: this.model1.diaryTitle,
							content: this.model1.diaryValue,
							date: new Date(this.model1.diaryDate).getTime(),
							id: this.model1.diaryId
						},
						success: (res) => {
							if (res.data.status === 1) {
								uni.$u.toast('修改失败')
								return
							}
							this.close()
							this.$refs.paging.reload()
						}
					})
				}).catch(errors => {
					uni.$u.toast('校验失败')
				})

			}, 300),
			close() {
				this.showpopup = false
				this.model1.diaryTitle = ''
				this.model1.diaryValue = ''
				this.model1.diaryDate = ''
				this.model1.diaryId = null
				this.flag = 0
			},
			changeDiary(e) {
				this.model1.diaryTitle = e.title
				this.model1.diaryValue = e.content
				this.model1.diaryDate = uni.$u.timeFormat(e.date, 'yyyy-mm-dd')
				this.model1.diaryId = e.id
				this.flag = 1
				this.showpopup = true
			},
			diaryDateClose() {
				this.showDate = false
				this.$refs.form1.validateField('diaryDate')
			},
			diaryDateConfirm(e) {
				this.showDate = false
				this.model1.diaryDate = uni.$u.timeFormat(e.value, 'yyyy-mm-dd')
				this.$refs.form1.validateField('diaryDate')
			},
			openCalendar() {
				this.showCalendar = true
			},
			selectDiaryTime(e) {
				this.showCalendar = false
				this.firstTime = new Date(e[0]).getTime()
				this.endTime = new Date(e[e.length - 1]).getTime()
				this.$refs.paging.reload(true)
			},
			deleteDiary: debounce(function(e) {
				const userName = this.userName
				uni.request({
					url: 'https://api.esick.work/wxapi/deleteDiary',
					method: 'POST',
					data: {
						userName: userName,
						id: e
					},
					success: (res) => {
						this.close()
						this.showpopup = false
						uni.$u.toast('删除成功')
						this.$refs.paging.reload()
					}
				})
			}, 500),
			hideKeyboard() {
				uni.hideKeyboard()
			},
			onPageScroll(e) {
				this.scrollTop = e.scrollTop;
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.title {
		height: 80px;
		display: flex;
		align-items: center;
	}

	.select_input {
		width: 85%;
	}

	.section {
		width: 100%;
	}

	.section_top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 60%;
		margin: 0 auto;
	}

	.item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.listItem {
		height: 120px;
	}

	.listTitle {
		margin: 8px
	}

	.listContent {
		margin: 8px;
	}

	.popup {
		width: 350px;
		/* height: 350px; */
		padding: 8px;
		border-radius: 8px;
	}
</style>
