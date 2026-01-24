import { h, cn } from '../utils/ui';
import { useState } from 'react';

export const RadarChart = ({ metrics }) => {
    const [hoveredAxis, setHoveredAxis] = useState(null);

    // Chart configuration
    const size = 300;
    const center = size / 2;
    const maxRadius = size / 2 - 40;
    const levels = 5;

    // Axes configuration
    const axes = [
        { key: 'entropy', label: 'Entropy', angle: -90, description: 'Average password strength and randomness' },
        { key: 'reuse', label: 'No Reuse', angle: -18, description: 'Passwords are unique across accounts' },
        { key: 'aging', label: 'Freshness', angle: 54, description: 'Passwords are recently updated' },
        { key: 'breachRisk', label: 'Breach Safe', angle: 126, description: 'No common or leaked passwords' },
        { key: 'health', label: 'Health', angle: 198, description: 'Overall vault security score' }
    ];

    // Convert polar to cartesian
    const polarToCartesian = (angle, radius) => {
        const rad = (angle * Math.PI) / 180;
        return {
            x: center + radius * Math.cos(rad),
            y: center + radius * Math.sin(rad)
        };
    };

    // Generate grid levels
    const gridLevels = Array.from({ length: levels }, (_, i) => {
        const radius = maxRadius * ((i + 1) / levels);
        const points = axes.map(axis => polarToCartesian(axis.angle, radius));
        return points.map(p => `${p.x},${p.y}`).join(' ');
    });

    // Generate data polygon
    const dataPoints = axes.map(axis => {
        const value = metrics[axis.key] || 0;
        const radius = (value / 100) * maxRadius;
        return polarToCartesian(axis.angle, radius);
    });
    const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    return h('div', { className: 'flex flex-col gap-4' },
        h('h3', { className: 'text-lg font-bold text-white' }, 'Security Radar'),

        h('div', { className: 'flex flex-col md:flex-row gap-6 items-center' },
            // Radar chart
            h('div', { className: 'relative' },
                h('svg', {
                    width: size,
                    height: size,
                    className: 'overflow-visible'
                },
                    // Grid levels
                    gridLevels.map((points, i) =>
                        h('polygon', {
                            key: `grid-${i}`,
                            points,
                            fill: 'none',
                            stroke: '#27272a',
                            strokeWidth: 1,
                            opacity: 0.3
                        })
                    ),

                    // Axis lines
                    axes.map((axis, i) => {
                        const end = polarToCartesian(axis.angle, maxRadius);
                        return h('line', {
                            key: `axis-${i}`,
                            x1: center,
                            y1: center,
                            x2: end.x,
                            y2: end.y,
                            stroke: hoveredAxis === axis.key ? '#10b981' : '#3f3f46',
                            strokeWidth: hoveredAxis === axis.key ? 2 : 1,
                            className: 'transition-all'
                        });
                    }),

                    // Data polygon (filled area)
                    h('polygon', {
                        points: dataPolygon,
                        fill: '#10b981',
                        fillOpacity: 0.15,
                        stroke: '#10b981',
                        strokeWidth: 2,
                        strokeLinejoin: 'round'
                    }),

                    // Data points
                    dataPoints.map((point, i) =>
                        h('circle', {
                            key: `point-${i}`,
                            cx: point.x,
                            cy: point.y,
                            r: 4,
                            fill: '#10b981',
                            stroke: '#18181b',
                            strokeWidth: 2
                        })
                    ),

                    // Axis labels
                    axes.map((axis, i) => {
                        const labelPos = polarToCartesian(axis.angle, maxRadius + 20);
                        const value = metrics[axis.key] || 0;

                        return h('g', {
                            key: `label-${i}`,
                            onMouseEnter: () => setHoveredAxis(axis.key),
                            onMouseLeave: () => setHoveredAxis(null),
                            className: 'cursor-pointer'
                        },
                            h('text', {
                                x: labelPos.x,
                                y: labelPos.y,
                                textAnchor: 'middle',
                                dominantBaseline: 'middle',
                                fill: hoveredAxis === axis.key ? '#10b981' : '#a1a1aa',
                                fontSize: 12,
                                fontWeight: 'bold',
                                className: 'transition-colors select-none'
                            }, axis.label),
                            h('text', {
                                x: labelPos.x,
                                y: labelPos.y + 14,
                                textAnchor: 'middle',
                                fill: '#71717a',
                                fontSize: 10,
                                className: 'select-none'
                            }, `${value}%`)
                        );
                    })
                )
            ),

            // Legend / Explanation
            h('div', { className: 'flex-1 flex flex-col gap-2' },
                axes.map(axis =>
                    h('div', {
                        key: `legend-${axis.key}`,
                        className: cn(
                            'p-2 rounded text-sm transition-all cursor-pointer',
                            hoveredAxis === axis.key ? 'bg-green-900/20 border-l-2 border-l-green-500' : 'bg-zinc-900/30'
                        ),
                        onMouseEnter: () => setHoveredAxis(axis.key),
                        onMouseLeave: () => setHoveredAxis(null)
                    },
                        h('div', { className: 'flex justify-between items-center mb-1' },
                            h('span', { className: 'font-bold text-white' }, axis.label),
                            h('span', {
                                className: cn(
                                    'text-xs font-mono',
                                    metrics[axis.key] >= 80 ? 'text-green-400' :
                                        metrics[axis.key] >= 50 ? 'text-yellow-400' :
                                            'text-red-400'
                                )
                            }, `${metrics[axis.key]}%`)
                        ),
                        h('p', { className: 'text-xs text-gray-400' }, axis.description)
                    )
                )
            )
        )
    );
};
