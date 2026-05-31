import '../../styles/loader.css'

export default function PlayraLoader() {
  return (
    <div className="ploader">
      <div className="ploader-glow" />
      <div className="ploader-stack">
        <div className="ploader-mark">
          <div className="ploader-p">
            <div className="ploader-fill" />
          </div>
        </div>
        <div className="ploader-word">playra</div>
        <div className="ploader-bar"><span /></div>
      </div>
    </div>
  )
}
