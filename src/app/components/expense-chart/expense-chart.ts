import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense';
import * as d3 from 'd3';

@Component({
  selector: 'app-expense-chart',
  imports: [CommonModule],
  templateUrl: './expense-chart.html',
  styleUrl: './expense-chart.css',
})
export class ExpenseChart implements OnInit, AfterViewInit {
  @ViewChild('chart', { static: true }) chartElement!: ElementRef;
  expensesByCategory: { [category: string]: number } = {};

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    this.loadExpensesByCategory();
  }

  ngAfterViewInit() {
    this.createChart();
  }

  loadExpensesByCategory() {
    this.expensesByCategory = this.expenseService.getExpensesByCategory();
    if (this.chartElement) {
      this.createChart();
    }
  }

  createChart() {
    const element = this.chartElement.nativeElement;
    d3.select(element).selectAll('*').remove(); // Clear previous chart

    const data = Object.entries(this.expensesByCategory).map(([category, amount]) => ({
      category,
      amount
    }));

    if (data.length === 0) {
      d3.select(element)
        .append('text')
        .attr('x', 200)
        .attr('y', 150)
        .attr('text-anchor', 'middle')
        .text('No expenses to display');
      return;
    }

    const width = 400;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie<{ category: string; amount: number }>()
      .value(d => d.amount)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<{ category: string; amount: number }>>()
      .innerRadius(0)
      .outerRadius(radius);

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const arcs = svg.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(i.toString()))
      .attr('stroke', 'white')
      .style('stroke-width', '2px');

    // Add labels
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'white')
      .text(d => `${d.data.category}: $${d.data.amount.toFixed(2)}`);

    // Add legend
    const legend = svg.selectAll('.legend')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${width / 2 - 100}, ${-height / 2 + i * 20})`);

    legend.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', (d, i) => color(i.toString()));

    legend.append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .style('font-size', '12px')
      .text(d => `${d.category}: $${d.amount.toFixed(2)}`);
  }
}
