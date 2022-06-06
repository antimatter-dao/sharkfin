import { useEffect, useRef, useState } from 'react'
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, BarController } from 'chart.js'
import { Box, Typography } from '@mui/material'
import Divider from 'components/Divider'
import { ChartDataType } from 'hooks/usePastPositionRecords'
import useBreakpoint from 'hooks/useBreakpoint'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, BarController)
const defaultTooltip = {
  date: '-',
  profit: '-',
  interestRate: '-',
  price: '-',
  returnedAmount: '-'
}

export default function BarChart({ chartData }: { chartData: ChartDataType }) {
  const [hasChart, setHasChart] = useState<any>(undefined)
  const [tooltipData, setTooltipDataData] = useState<{
    date: string
    profit: string
    interestRate: string
    price: string
    returnedAmount: string
  }>({
    date: '-',
    profit: '-',
    interestRate: '-',
    price: '-',
    returnedAmount: '-'
  })

  const ctx = useRef(null)
  const tooltip = useRef<HTMLDivElement>(null)
  const isDownSm = useBreakpoint('sm')

  useEffect(() => {
    if (!ctx.current) {
      return
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      FontFace: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
      outerHeight: isDownSm ? '200px' : '100%',
      scales: {
        x: {
          color: '#25252550',
          grid: {
            display: true,
            drawBorder: true,
            drawOnChartArea: false,
            drawTicks: false
          }
          // scaleLabel: {
          //   position: 'left',
          //   display: true,
          //   labelString: 'Delivery Date',
          //   color: '#252525'
          // }
        },
        y: {
          color: '#25252550',
          grid: {
            drawBorder: false,
            drawTicks: false
          },
          ticks: {
            callback: function(value: any) {
              if (+value / 1000 > 1) {
                return '$' + value / 1000 + 'k'
              }
              return '$' + value
            }
          }
        }
      },
      plugins: {
        tooltip: {
          enabled: false,
          external: function(context: any) {
            if (!tooltip.current) return
            const tooltipEl = tooltip.current

            // Hide if no tooltip
            const tooltipModel = context.tooltip
            if (tooltipModel.opacity == 0) {
              if (!isDownSm) {
                tooltipEl.style.opacity = '0'
              } else {
                setTooltipDataData(defaultTooltip)
              }

              return
            }

            if (tooltipModel.body) {
              const curData = tooltipModel.dataPoints[0]
              const dataIndex = curData.dataIndex
              setTooltipDataData(prev => ({
                ...prev,
                date: curData.label,
                returnedAmount: curData.formattedValue,
                price: chartData.otherData[dataIndex].price,
                profit: chartData.otherData[dataIndex].pnl,
                interestRate: chartData.otherData[dataIndex].rate
              }))
            }

            const position = context.chart.canvas.getBoundingClientRect()

            // Display, position, and set styles for font
            tooltipEl.style.opacity = '1'
            if (isDownSm) {
              tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px'
              tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY - 25 + 'px'
            } else {
              tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px'
              tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY - 85 + 'px'
            }

            // tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px'
            // tooltipEl.style.pointerEvents = 'none'
          }
        }
      }
    }

    const labels = chartData.dateData

    const data = {
      labels,
      datasets: [
        {
          label: 'Returned Amount',
          data: chartData.returnedAmountData,
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
  }, [chartData.dateData, chartData.otherData, chartData.returnedAmountData, hasChart, isDownSm])

  return (
    <Box width="100%" height={'100%'}>
      <Box width="100%" height={isDownSm ? 300 : '100%'}>
        <canvas id="barChart" width="100%" height={isDownSm ? 'calc(100% - 200px)' : '100%'} ref={ctx}></canvas>
      </Box>
      <Box
        ref={tooltip}
        padding="12px 14px"
        sx={{
          pointerEvents: 'none',
          position: isDownSm ? 'static' : 'absolute',
          opacity: isDownSm ? '1!important' : 0,
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          width: isDownSm ? '100%' : 'auto',
          marginTop: isDownSm ? 11 : 0,
          boxShadow: isDownSm ? 'none' : '0px 1px 10px rgba(0, 0, 0, 0.1)',
          transform: isDownSm ? 'none' : 'translate(-55%,-100%)',
          minWidth: 'max-content'
        }}
      >
        <Box display="flex" gap={15} alignItems="center">
          <Box height={10} width={10} borderRadius="50%" sx={{ background: '#31B047' }}></Box>
          <Typography fontWeight={700}>{tooltipData.date}</Typography>
        </Box>
        <Divider extension={14} style={{ marginTop: '10px', marginBottom: '10px' }} color="#25252510" />
        <Box display="grid">
          <Typography>
            Returned Amount:&nbsp;&nbsp;
            <Typography component="span" fontWeight={500}>
              {tooltipData.returnedAmount} USDT
            </Typography>
          </Typography>
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
    </Box>
  )
  // return null
}
