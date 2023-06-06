<template>
	<view class="container">
		<view style="color: #FFFFFF;font-size: 64rpx;">
			功德数：{{nums}}
		</view>
		<button type="default" @click="autoClick()">自动</button>
		<image src="../../static/e9a4f2eeadbcbe2ff5a0acae54dae43b3a86786b.jpg" mode="" @click="clickMuYu()"></image>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import {
		debounce
	} from '@/util/debounce.js'
	export default {
		name: "muyu",
		data() {
			return {
				nums: 0,
				timer: null
			}
		},
		methods: {
			clickMuYu() {
				this.nums += 1
				this.$refs.uToast.show({
					message: '功德+1',
					position: 'top',
					duration: 200
				})
			},
			autoClick() {
				this.timer = setInterval(() => {
					this.clickMuYu()
				}, 500)
			}
		},
		onHide() {
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
		}
	}
</script>

<style>
	.container {
		background: #000000;
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
