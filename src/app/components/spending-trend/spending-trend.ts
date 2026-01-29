import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense';
import * as d3 from 'd3';

@Component({
  selector: 'app-spending-trend',
  imports: [CommonModule],
  templateUrl: './spending-trend.html',
  styleUrl: './spending-trend.css',
})
export class SpendingTrend implements OnInit, AfterViewInit {
  @ViewChild('trendChart', { static: true }) chartElement!: ElementRef;
  expensesOverTime: { date: string; amount: number }[] = [];
  predictions: number[] = [];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.createChart();
  }

  loadData() {
    this.expensesOverTime = this.expenseService.getExpensesOverTime();
    this.predictions = this.expenseService.predictSpending(5);
    if (this.chartElement) {
      this.createChart();
    }
  }

  createChart() {
    const element = this.chartElement.nativeElement;
    d3.select(element).selectAll('*').remove(); // Clear previous chart

    if (this.expensesOverTime.length === 0) {
      d3.select(element)
        .append('text')
        .attr('x', 200)
        .attr('y', 150)
        .attr('text-anchor', 'middle')
        .text('No expense data available for trend analysis');
      return;
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data for chart
    const historicalData = this.expensesOverTime.map((d, i) => ({ x: i, y: d.amount, date: d.date }));
    const predictionData = this.predictions.map((amount, i) => ({
      x: this.expensesOverTime.length + i,
      y: amount,
      date: `Day ${this.expensesOverTime.length + i + 1}`
    }));

    const allData = [...historicalData, ...predictionData];

    // Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(allData, d => d.x) as [number, number])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(allData, d => d.y) as number])
      .range([height, 0]);

    // Line generator
    const line = d3.line<{ x: number; y: number }>()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat((d, i) => {
        if (i < historicalData.length) {
          return historicalData[i].date;
        } else {
          return predictionData[i - historicalData.length].date;
        }
      }));

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `$${d}`));

    // Historical line
    svg.append('path')
      .datum(historicalData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Prediction line (dashed)
    if (predictionData.length > 0) {
      svg.append('path')
        .datum(predictionData)
        .attr('fill', 'none')
        .attr('stroke', 'orange')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', line);
    }

    // Add points for historical data
    svg.selectAll('.historical-point')
      .data(historicalData)
      .enter()
      .append('circle')
      .attr('class', 'historical-point')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 4)
      .attr('fill', 'steelblue');

    // Add points for prediction data
    svg.selectAll('.prediction-point')
      .data(predictionData)
      .enter()
      .append('circle')
      .attr('class', 'prediction-point')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 4)
      .attr('fill', 'orange');

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 150}, 20)`);

    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 20)
      .attr('y2', 0)
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text('Historical');

    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 20)
      .attr('x2', 20)
      .attr('y2', 20)
      .attr('stroke', 'orange')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    legend.append('text')
      .attr('x', 25)
      .attr('y', 20)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text('Predicted');
  }
}
