import { useEffect, useState } from 'react'
import { ForceGraph2D, ForceGraph3D } from 'react-force-graph'
import { choose } from '../util'

function genRandomTree(N = 300, reverse = false) {
  return {
    nodes: [...Array(N)].map((_, i) => ({ id: i })),
    links: [...Array(N)]
      .map((_, i) => i)
      .filter((id) => id)
      .map((id) => ({
        [reverse ? 'target' : 'source']: id,
        [reverse ? 'source' : 'target']: Math.round(Math.random() * (id - 1)),
      })),
  }
}

interface GraphData {
  nodes: NodeObject[]
  links: LinkObject[]
}

type NodeObject = object & {
  id?: string | number
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number
  fy?: number
}

type LinkObject = object & {
  source?: string | number | NodeObject
  target?: string | number | NodeObject
}

function getLinksToNode(node: any, data: GraphData) {
  return data.links.filter((l) => l.target === node)
}

function getLinksFromNode(node: any, data: GraphData) {
  return data.links.filter((l) => l.source === node)
}

function step(data: GraphData) {
  const res = { ...data }
  for (let i = 0; i < 15; i++) {
    const n = choose(data.nodes)

    const linksTo = getLinksToNode(n, data)
    const linksFrom = getLinksFromNode(n, data)

    const secondDegree = linksTo.flatMap((l) => getLinksToNode(l.source, data))
    // console.log({ linksTo, linksFrom, n, secondDegree })
    if (linksTo.length > 0 && secondDegree.length > 2) {
      res.links.push({
        source: n,
        target: choose(secondDegree).source,
      })
    }
  }

  return res
}

export function Graph() {
  const [data, setData] = useState<GraphData>({ links: [], nodes: [] })
  const [count, setCount] = useState(0)

  useEffect(() => {
    setTimeout(() => setData(genRandomTree()), 1000)
  }, [])

  useEffect(() => {
    const i = setInterval(() => {
      if (count < 256) {
        setData(step(data))
        setCount(count + 1)
      }
    }, 25)

    return () => clearInterval(i)
  }, [setData, data, count, setCount])

  // console.log(data)

  return (
    <ForceGraph3D
      graphData={data}
      linkWidth={3}
      linkAutoColorBy="source"
      nodeAutoColorBy="id"
      nodeLabel="id"
    />
  )
}
