/*
	This file is a modified version of:
	https://github.com/KraXen72/crankshaft/blob/master/src/switches.ts

	Original project: https://github.com/KraXen72/crankshaft
	License: GNU General Public License v3.0 (GPL-3.0)

	This file retains the GPL-3.0 license and all original credit.
*/
module.exports = function applySwitches(app, settings) {
	const appendSwitch = app.commandLine.appendSwitch;

	if (settings.get("safeFlags_removeUselessFeatures")) {
		appendSwitch('disable-breakpad');
		appendSwitch('disable-print-preview');
		appendSwitch('disable-metrics-repo');
		appendSwitch('disable-metrics');
		appendSwitch('disable-2d-canvas-clip-aa');
		appendSwitch('disable-bundled-ppapi-flash');
		appendSwitch('disable-logging');
		appendSwitch('disable-hang-monitor');
		appendSwitch('disable-component-update');
		if (process.platform === 'darwin') appendSwitch('disable-dev-shm-usage');

		console.log('switches: Removed useless features');
	}
	if (settings.get("safeFlags_helpfulFlags")) {
		appendSwitch('enable-javascript-harmony');
		appendSwitch('enable-future-v8-vm-features');
		appendSwitch('enable-webgl');
		appendSwitch('enable-webgl2-compute-context');
		appendSwitch('disable-background-timer-throttling');
		appendSwitch('disable-renderer-backgrounding');
		appendSwitch('autoplay-policy', 'no-user-gesture-required');

		console.log('switches: Applied helpful flags');
	}
	if (settings.get("experimentalFlags_increaseLimits")) {
		appendSwitch('renderer-process-limit', '100');
		appendSwitch('max-active-webgl-contexts', '100');
		appendSwitch('webrtc-max-cpu-consumption-percentage', '100');
		appendSwitch('ignore-gpu-blacklist');

		console.log('switches: Applied flags to increase limits');
	}
	if (settings.get("experimentalFlags_lowLatency")) {
		appendSwitch('enable-highres-timer');
		appendSwitch('enable-quic');
		appendSwitch('enable-accelerated-2d-canvas');

		console.log('switches: Applied latency-reducing flags');
	}
	if (settings.get("experimentalFlags_experimental")) {
		appendSwitch('disable-low-end-device-mode');
		appendSwitch('enable-accelerated-video-decode');
		appendSwitch('enable-native-gpu-memory-buffers');
		appendSwitch('high-dpi-support', '1');
		appendSwitch('ignore-gpu-blacklist');
		appendSwitch('no-pings');
		appendSwitch('no-proxy-server');

		console.log('switches: Enabled Experiments');
	}
	if (settings.get("safeFlags_gpuRasterizing")) {
		appendSwitch('enable-gpu-rasterization');
		appendSwitch('enable-oop-rasterization');
		appendSwitch('disable-zero-copy');

		console.log('switches: GPU rasterization active');
	}

	if (settings.get("fpsUncap")) {
		appendSwitch('disable-frame-rate-limit');
		appendSwitch('disable-gpu-vsync');
		appendSwitch('max-gum-fps', '9999');
		appendSwitch('enable-features', 'ImplLatencyRecovery,MainLatencyRecovery');

		console.log('switches: Removed FPS Cap');
	}

	if (settings.get("angle_backend") !== 'default') {
		if (settings.get("angle_backend") === 'vulkan') {
			appendSwitch('use-angle', 'vulkan');
			appendSwitch('use-vulkan');
			appendSwitch('--enable-features=Vulkan');

			console.log('switches: VULKAN INITIALIZED');
		} else {
			appendSwitch('use-angle', settings.get("angle_backend"));

			console.log(`Using Angle: ${settings.get("angle_backend")}`);
		}
	}

	if (settings.get("inProcessGPU")) {
		appendSwitch('in-process-gpu');
		
		console.log('switches: In Process GPU is active');
	}
}