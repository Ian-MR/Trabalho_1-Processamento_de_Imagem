const InputImagem = document.querySelector("#inputImagem")
const canvas1 = document.querySelector("#canvas1")
const ctx1 = canvas1.getContext("2d")
const canvas2 = document.querySelector("#canvas2")
const ctx2 = canvas2.getContext("2d")
const canvas3 = document.querySelector("#canvas3")
const ctx3 = canvas3.getContext("2d")
const canvasHistograma = document.querySelector("#histograma")
const ctxHistograma = canvasHistograma.getContext("2d")

let histogramaGlobal

InputImagem.addEventListener("change", (event)=>{
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()

  reader.readAsDataURL(file)
  reader.onload = (e) => {
    const img = new Image()
    img.src = e.target.result
    img.onload = () => {
      canvas1.width = img.width
      canvas1.height = img.height
      ctx1.drawImage(img,0,0)
      //
      const imageData = ctx1.getImageData(0,0,canvas1.width,canvas1.height)
      const data = imageData.data
      for(let i=0 ; i< data.length; i+=4){
        const gray = (data[i]+data[i+1]+data[i+2])/3
        data[i] = gray
        data[i+1] = gray
        data[i+2] = gray
      }
      canvas2.width = canvas1.width
      canvas2.height = canvas1.height
      ctx2.putImageData(imageData,0,0)
      //
      const imageGrayData = ctx2.getImageData(0,0,canvas2.width, canvas2.height)
      const grayData = imageGrayData.data

      const histograma = new Array(256).fill(0)
      for(let i=0;i<grayData.length;i+=4){
        let j = grayData[i]
        histograma[j]++
      }
      histogramaGlobal = histograma
      ctxHistograma.clearRect(0,0,canvasHistograma.width, canvasHistograma.height)
      const binWidth = canvasHistograma.width/256
      const maxValue = Math.max.apply(Math, histograma)
      console.log(maxValue)
      for(let i = 0; i<histograma.length;i++){
        const barHeigth = (histograma[i]/maxValue) * (canvasHistograma.height - 20)
        ctxHistograma.fillStyle = "black"
        ctxHistograma.fillRect(i*binWidth,canvasHistograma.height - 20 - barHeigth, binWidth, barHeigth)
      }

      const gradient = ctxHistograma.createLinearGradient(0,canvasHistograma.height-20,canvasHistograma.width, canvasHistograma.height-20)
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(1, 'black');
      ctxHistograma.fillStyle = gradient
      ctxHistograma.fillRect(0, canvasHistograma.height - 15, canvasHistograma.width, 15)
      //
      const totalPixels = grayData.length/4
      var maxVariancia=0, tresholding = 0
      for(let i = 0; i<256;i++){
        let omega0 = 0,omega1 = 0,mi0 = 0,mi1 = 0,miT = 0
        for(let j =0; j<i;j++){
          omega0 += histograma[j]/totalPixels
        }
        for(let j=i;j<256;j++){
          omega1 += histograma[j]/totalPixels
        }
        for(let j=0;j<i;j++){
          mi0 += (j*(histograma[j]/totalPixels))/omega0
        }
        for(let j=i;j<256;j++){
          mi1 += (j*(histograma[j]/totalPixels))/omega1
        }
        for(let j=0;j<256;j++){
          miT += j*(histograma[j]/totalPixels)
        }
        var variancia = omega0*(Math.pow((mi0-miT),2))+omega1*(Math.pow((mi1-miT),2))
        
        if(variancia>maxVariancia){
          maxVariancia = variancia
          tresholding = i
        }
      }
      console.log(tresholding)
      //

      
      for(let i = 0;i<grayData.length;i+=4){
        let color = grayData[i] > tresholding ? 255 : 0
        grayData[i] = color
        grayData[i+1] = color
        grayData[i+2] = color
      }
      canvas3.width = canvas2.width
      canvas3.height = canvas2.height
      ctx3.putImageData(imageGrayData,0,0)
    }
  }
})

