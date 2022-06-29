import p5Types from 'p5'

export function upscale(p5: p5Types, graphics: p5Types.Graphics, scale: number) {
  graphics.loadPixels()
  const { width, height } = graphics
  const upscaled = p5.createGraphics(width * scale, height * scale)
  upscaled.pixelDensity(graphics.pixelDensity())
  upscaled.loadPixels()

  const srcPixels = new Int32Array(graphics.pixels)

  for (let x = 0; x < width * 4; x++) {
    for (let y = 0; y < height * 4; y++) {
      const index = (x + y * width) * 4
      const srcPixel = [
        srcPixels[index],
        srcPixels[index + 1],
        srcPixels[index + 2],
        srcPixels[index + 3],
      ]

      for (let i = 0; i < scale; i++) {
        for (let j = 0; j < scale; j++) {
          const newIndex = (scale * x + i + (scale * y + j) * (scale * width)) * 4
          upscaled.pixels[newIndex] = srcPixel[0]
          upscaled.pixels[newIndex + 1] = srcPixel[1]
          upscaled.pixels[newIndex + 2] = srcPixel[2]
          upscaled.pixels[newIndex + 3] = srcPixel[3]
        }
      }
    }
  }

  upscaled.updatePixels()
  return upscaled
}
