export function DemoVideo() {
  return (
    <figure className="demo-frame">
      <video controls playsInline preload="metadata" aria-label="Glance for Windows product demo">
        <source src="/assets/demo/glance-demo.mp4" type="video/mp4" />
        Your browser cannot play this video. <a href="/assets/demo/glance-demo.mp4">Download the Glance demo video</a>.
      </video>
      <figcaption>Glance 0.1.7 · A quick look at the Windows app and face-unlock flow. <a href="/assets/demo/glance-demo.mp4">Download the demo video</a>.</figcaption>
    </figure>
  );
}
