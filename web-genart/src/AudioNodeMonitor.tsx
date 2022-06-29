import p5Types from 'p5'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as Tone from 'tone'
import './App.css'
import { P5Sketch } from './p5sketch'

function damp(q: p5Types, a: number, b: number, lambda: number) {
  return q.lerp(a, b, 1 - Math.exp(-lambda * q.deltaTime))
}

export type FrequencyWindowProps = {
  input: Tone.Volume
  width: number
  height: number
  fftAnalysisSampleRate?: number
  detail?: number
}

export function FrequencyWindow({
  input,
  width,
  height,
  fftAnalysisSampleRate = 24,
  detail = 2,
}: FrequencyWindowProps) {
  const analyserNode = useMemo(() => {
    const n = input.context.createAnalyser()
    n.fftSize = 2048 * detail
    return n
  }, [input, detail])
  const timeDomainData = useRef(new Float32Array(analyserNode.fftSize))
  const timeDomainTarget = useRef(new Float32Array(analyserNode.fftSize))
  const frequencyData = useRef(new Float32Array(analyserNode.frequencyBinCount))
  const frequencyTarget = useRef(new Float32Array(analyserNode.frequencyBinCount))

  useEffect(() => {
    input.connect(analyserNode)

    return () => {
      analyserNode.disconnect()
    }
  })

  useEffect(() => {
    const i = setInterval(() => {
      analyserNode.getFloatTimeDomainData(timeDomainData.current)
    }, (1 / fftAnalysisSampleRate) * 1000)

    return () => clearInterval(i)
  })

  const setup = useCallback((q: p5Types) => {}, [])

  const draw = useCallback(
    (q: p5Types) => {
      analyserNode.getFloatFrequencyData(frequencyData.current)

      for (let i = 0; i < timeDomainData.current.length; i++) {
        timeDomainData.current[i] = damp(
          q,
          timeDomainData.current[i],
          timeDomainTarget.current[i],
          0.01
        )

        frequencyData.current[i] = damp(
          q,
          frequencyData.current[i],
          frequencyTarget.current[i],
          0.01
        )
      }

      q.background(0, 96)

      q.noStroke()
      q.fill(255, 255, 255, 64)

      // analyserNode.getFloatTimeDomainData(analyserData.current)

      q.beginShape()
      q.vertex(0, q.height)

      for (let i = 0; i < frequencyData.current.length; i++) {
        // -1...1
        const amplitude = frequencyData.current[i] / 100

        const y = q.map(
          amplitude,
          0,
          -1,
          q.height / 2 - q.height / 4,
          q.height / 2 + q.height / 4
        )

        const x = q.map(i, 0, frequencyData.current.length - 1, 0, q.width)

        q.vertex(x, y)
      }

      q.vertex(q.width, q.height)
      q.endShape()

      q.noFill()
      q.stroke(128, 255, 128, 255)

      // analyserNode.getFloatTimeDomainData(analyserData.current)

      q.beginShape()

      for (let i = 0; i < timeDomainData.current.length; i++) {
        // -1...1
        const amplitude = timeDomainData.current[i]

        const y = q.map(
          amplitude,
          -1,
          1,
          q.height / 2 - q.height / 4,
          q.height / 2 + q.height / 4
        )

        const x = q.map(i, 0, timeDomainData.current.length - 1, 0, q.width)

        q.vertex(x, y)
      }

      q.endShape()
    },
    [frequencyData, timeDomainData, timeDomainTarget, frequencyTarget, analyserNode]
  )

  return <P5Sketch setup={setup} draw={draw} width={width} height={height} />
}

export function AudioNodeMonitor({
  input,
  width,
  height,
  detail = 2,
}: FrequencyWindowProps) {
  const [volume, setVolume] = useState(-12)
  const onChangeVolume = (e: any) => {
    input.volume.value = e.target.value
    setVolume(e.target.value)
  }
  return (
    <div>
      <button onClick={() => (input.mute = !input.mute)}>mute</button>
      <input
        type="range"
        min="-25"
        max="-5"
        value={volume}
        onChange={onChangeVolume}
        className="slider"
        step={0.1}
      ></input>
      {volume}
      <FrequencyWindow
        input={input}
        width={width}
        height={height}
        detail={detail}
        fftAnalysisSampleRate={30}
      />
    </div>
  )
}
