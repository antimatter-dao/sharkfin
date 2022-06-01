import { useEffect, useRef, useState } from 'react'
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, BarController } from 'chart.js'
import { Box, Typography } from '@mui/material'
import Divider from 'components/Divider'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, BarController)

export default function BarChart() {
  const [hasChart, setHasChart] = useState<any>(undefined)
  const [tooltipData, setTooltipDataData] = useState<{
    date: string
    profit: string
    interestRate: string
    price: string
  }>({
    date: '-',
    profit: '-',
    interestRate: '-',
    price: '-'
  })

  const ctx = useRef(null)
  const tooltip = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ctx.current) {
      return
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: true,
            drawBorder: true,
            drawOnChartArea: false,
            drawTicks: false
          },
          scaleLabel: {
            position: 'left',
            display: true,
            labelString: 'Delivery Date'
          }
        },
        y: {
          grid: {
            drawBorder: false
          }
        }
      },
      plugins: {
        tooltip: {
          // backgroundColor: '#ffffff',
          // bodyColor: '#252525',
          // titleColor: '#252525',
          // padding: 12,
          // label: '11111111111'
          enabled: false,
          external: function(context: any) {
            // Tooltip Element
            // let tooltipEl = document.getElementById('chartjs-tooltip')

            // // Create element on first render
            // if (!tooltipEl) {
            //   tooltipEl = document.createElement('div')
            //   tooltipEl.id = 'chartjs-tooltip'
            //   tooltipEl.innerHTML = '<table></table>'
            //   document.body.appendChild(tooltipEl)
            // }
            if (!tooltip.current) return

            const tooltipEl = tooltip.current

            // Hide if no tooltip
            const tooltipModel = context.tooltip
            if (tooltipModel.opacity == 0) {
              tooltipEl.style.opacity = '0'
              return
            }

            // Set caret Position
            tooltipEl.classList.remove('above', 'below', 'no-transform')
            if (tooltipModel.yAlign) {
              tooltipEl.classList.add(tooltipModel.yAlign)
            } else {
              tooltipEl.classList.add('no-transform')
            }

            function getBody(bodyItem: any) {
              return bodyItem.lines
            }

            // Set Text
            if (tooltipModel.body) {
              const titleLines = tooltipModel.title || []
              const bodyLines = tooltipModel.body.map(getBody)

              let innerHtml = '<thead>'

              titleLines.forEach(function(title: any) {
                innerHtml += '<tr><th>' + title + '</th></tr>'
              })
              innerHtml += '</thead><tbody>'

              bodyLines.forEach(function(body: any, i: any) {
                const colors = tooltipModel.labelColors[i]
                let style = 'background:' + colors.backgroundColor
                style += '; border-color:' + colors.borderColor
                style += '; border-width: 2px'
                const span = '<span style="' + style + '"></span>'
                innerHtml += '<tr><td>' + span + body + '</td></tr>'
              })
              innerHtml += '</tbody>'

              const tableRoot = tooltipEl.querySelector('table')
              if (tableRoot) {
                tableRoot.innerHTML = innerHtml
              }
            }
            setTooltipDataData(prev => ({ ...prev, date: context.label }))

            const position = context.chart.canvas.getBoundingClientRect()
            // const bodyFont = (Chart as any).helpers?.toFont(tooltipModel.options.bodyFont)

            // Display, position, and set styles for font
            tooltipEl.style.opacity = '1'
            tooltipEl.style.position = 'absolute'
            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px'
            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px'
            // tooltipEl.style.font = bodyFont?.string
            // tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px'
            // tooltipEl.style.pointerEvents = 'none'
          }
        }
      }
    }

    const labels = ['7 Jul', '14 Jul', '21 Jul', '28 Jul', '5 Aug', '12 Aug', '19 Aug', '26 Aug', '2 Sep']

    const data = {
      labels,
      datasets: [
        {
          label: 'Profit Amount',
          data: [42, 21, 60, 32, 42, 25, 15, 12, 82],
          backgroundColor: '#31B047',
          hoverBackgroundColor: '#156623',
          barPercentage: 0.6
        }
      ]
    }

    if (!hasChart) {
      setHasChart(
        new Chart(ctx.current, {
          type: 'bar',
          data: data,
          options
        })
      )
    } else {
      hasChart.options = options
      hasChart.data = data
      hasChart.update()
    }
  }, [hasChart])

  return (
    <Box width="100%" height="100%">
      <Box
        ref={tooltip}
        padding="12px 14px"
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          opacity: 0,
          background: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.1)',
          transform: 'translate(-50%,-100%)',
          minWidth: 'max-content'
        }}
      >
        <Box height={10} width={10} borderRadius="50%" sx={{ background: '#31B047' }}></Box>
        <Typography fontWeight={700}>{tooltipData.date}</Typography>
        <Divider extension={14} style={{ marginTop: '10px', marginBottom: '10px' }} color="#25252510" />
        <Box display="grid">
          <Typography>
            Profit Amount:&nbsp;&nbsp;
            <Typography component="span" fontWeight={500}>
              {tooltipData.profit} USDT
            </Typography>
          </Typography>
          <Typography>
            Interest rate:&nbsp;&nbsp;
            <Typography component="span" fontWeight={500}>
              {tooltipData.interestRate} %
            </Typography>
          </Typography>
          <Typography>
            Executed Price:&nbsp;&nbsp;
            <Typography component="span" fontWeight={500}>
              {tooltipData.price} USDT
            </Typography>
          </Typography>
        </Box>
      </Box>
      <canvas id="barChart" width="100%" height="100%" ref={ctx}></canvas>
    </Box>
  )
  // return null
}
