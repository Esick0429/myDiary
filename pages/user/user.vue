<template>
	<view>
		<view v-show="!show">
			<u-list>
				<u-list-item>
					<u-cell-group>
						<u-cell title="头像"><u-avatar slot="value" :src="yonghuwx.avatarUrl"></u-avatar></u-cell>
						<u-cell title="用户名"><u--text slot="value" :text="yonghuwx.nickName" align="right"></u--text></u-cell>
						<u-cell title="性别"><u--text slot="value" :text="yonghuwx.gender === 0 ?'男':'女'" align="right"></u--text></u-cell>
						<u-cell title="城市"><u--text slot="value" :text="yonghuwx.city" align="right"></u--text></u-cell>
						<u-cell title="省份"><u--text slot="value" :text="yonghuwx.province" align="right"></u--text></u-cell>
					</u-cell-group>
				</u-list-item>
			</u-list>
		</view>
		<view class="" v-show="show">
			<button class="sys_btn" @tap="getUserInfo">小程序登录授权</button>
		</view>
	</view>
</template>

<script>
	export default {
		name: "sada",
		data() {
			return {
				show: true,
				code: '',
				yonghuwx: [],

			}
		},
		onLoad() {
			uni.login({
					provider: "weixin",
					success: function(res) {
						console.log(res)
						let code = res.code
						uni.request({
							url: 'https://api.esick.work/wxapi/getSession',
							data: {
								code: code
							},
							success: (res) => {
								console.log(res.data);
							},
							fail(err) {
								console.log("获取openid失败")
							}
						});
					}
				}),
				this.getUser()
		},
		onShow() {
			this.yonghuwx = uni.getStorageSync('userInfo')
		
		},
		methods: {
			//#ifdef MP-WEIXIN
			getUserInfo() {
				var that = this
				uni.getUserProfile({
					desc: '用于完善会员资料',
					success(res) {
						console.log(res.userInfo);
						that.yonghuwx = res.userInfo;
						console.log(that.yonghuwx)
						that.show = false;
						uni.setStorage({
							key: 'userInfo',
							data: that.yonghuwx
						});
					},
					fail(err) {
						console.log("获取用户信息失败")
						console.log(err)
					}
				});

			},
			//#endif
			getUser() {
				const userInfo = uni.getStorageSync('userInfo');
				if (!userInfo) {
					console.log('用户未登录', userInfo)
				} else {
					this.show = false
				}
			}
		}
	}
</script>

<style>
	body {
		background-color: #f0eff4;
	}

	.login-input {
		margin: 0 auto;
	}

	.header {
		height: 400rpx;
		width: 100%;
		text-align: center;
		line-height: 200rpx;
		background-color: pink;
		color: #FFFFFF;
	}
</style>
