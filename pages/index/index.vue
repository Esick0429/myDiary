<template>
	<view class="content">
		<view class="title" @click="getDiary()">
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
					<u--text text="时间选择器"></u--text>
				</view>
				<u-line direction="col" color="1296db" length="160rpx"></u-line>
				<view class="btn_right item" @click="openWrite()">
					<u--image src="/static/write.png" width="80" height="80"></u--image>
					<u--text text="写日记"></u--text>
				</view>
			</view>
			<u-gap height="30" bgColor="#f8f8f8"></u-gap>
			<view style="height: 800px;">
				<scroll-view :style="{'height':'100%'}" scroll-y="true" refresher-enabled="false"
					:refresher-triggered="triggered" :refresher-threshold="45"
					@refresherrefresh="onRefresh" @refresherrestore="onRestore">
						<view v-if="diaryData.length > 0" >
							<u-list >
								<u-list-item v-for="(item, index) in diaryData" :key="item.id">
									<view class="listItem" @click="changeDiary(item)">
										<view class="listTitle">
											<u--text :text="item.title" bold="true" size="21"></u--text>
											<u--text mode="date" :text="item.date" size="12"></u--text>
										</view>
										<view class="listContent">
											<u--text :text="item.content" lines="3"></u--text>
										</view>
										<u-gap height="8" bgColor="#f8f8f8" marginTop="35"></u-gap>
									</view>
								</u-list-item>
							</u-list>
						</view>
				</scroll-view>
			</view>
			<u--text text="从今天开始记录美好的一天吧~" v-if="diaryData.length === 0"></u--text>
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
				// _freshing:true

			}
		},
		onLoad() {
			this._freshing = false;
			setTimeout(() => {
				this.triggered = true;
			}, 1000)
		},
		onShow() {
			this.userName = uni.getStorageSync('userInfo').nickName
			this.getDiary()
		},

		methods: {
			select(value) {
				console.log(typeof value)
				let userName = this.userName
				uni.request({
					url: `https://esick.xyz/wxapi/getDiary`,
					data: {
						userName: userName,
						title: value
					},
					success: (res) => {
						this.diaryData = res.data.results;
					}
				});
			},
			getDiary() {
				let userName = this.userName
				uni.request({
					url: `https://esick.xyz/wxapi/getDiary`,
					data: {
						userName: userName,
					},
					success: (res) => {
						console.log(res.data);
						this.diaryData = res.data.results;
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
			writeDiary: debounce(function() {
				this.$refs.form1.validate().then(res => {
					uni.$u.toast('校验通过')
					let userName = this.userName
					let url = ''
					if (this.flag === 1) {
						url = 'https://esick.xyz/wxapi/updateDiary'

					} else {
						url = 'https://esick.xyz/wxapi/addDiary'
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
								uni.$u.toast('校验失败')
								return
							}
							this.close()
							this.getDiary()
						}
					})
				}).catch(errors => {
					uni.$u.toast('校验失败')
				})

			}, 300),
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
				console.log(this.selectValue)
				let userName = this.userName
				let timeRange = [new Date(e[0]).getTime(), new Date(e[e.length - 1]).getTime()]
				uni.request({
					url: `https://esick.xyz/wxapi/getDiary`,
					data: {
						userName: userName,
						today: timeRange[0],
						lastday: timeRange[1],
						title: this.selectValue
					},
					success: (res) => {
						console.log(res.data);
						this.diaryData = res.data.results;
					}
				})
			},
			deleteDiary: debounce(function(e) {
				const userName = this.userName
				uni.request({
					url: 'https://esick.xyz/wxapi/deleteDiary',
					method: 'POST',
					data: {
						userName: userName,
						id: e
					},
					success: (res) => {
						console.log(res)
						this.getDiary()
						this.showpopup = false
					}
				})
			}, 500),

			hideKeyboard() {
				uni.hideKeyboard()
			},
			onRefresh() {
				if (this._freshing) return;
				this._freshing = true;
				if (!this.triggered) //界面下拉触发，triggered可能不是true，要设为true  
					this.triggered = true;
				setTimeout(() => {
					this.triggered = false; //触发onRestore，并关闭刷新图标  
					this._freshing = false;
				}, 1000)
			},
			onRestore() {
				this.getDiary()
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
