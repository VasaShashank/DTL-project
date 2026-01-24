import { h, cn } from '../utils/ui';

export const HealthTimeline = ({ timeline }) => {
    if (!timeline || timeline.length === 0) {
        return h('div', { className: 'text-center py-8 text-gray-500 text-sm' },
            'No historical data yet. Timeline will populate as you use the vault.'
        );
    }

    // Chart dimensions
    const width = 600;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Get data points (limit to last 30 days)
    const recentData = timeline.slice(-30);
    const maxScore = 100;
    const minScore = 0;

    // Calculate trend
    const trend = recentData.length >= 2
        ? recentData[recentData.length - 1].healthScore - recentData[0].healthScore
        : 0;

    // Create points for line chart
    const points = recentData.map((snapshot, idx) => {
        const x = padding.left + (idx / Math.max(recentData.length - 1, 1)) * chartWidth;
        const y = padding.top + chartHeight - ((snapshot.healthScore - minScore) / (maxScore - minScore)) * chartHeight;
        return { x, y, ...snapshot };
    });

    // Create path string
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Format date
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    return h('div', { className: 'flex flex-col gap-4' },
        // Header with trend
        h('div', { className: 'flex justify-between items-center' },
            h('h3', { className: 'text-lg font-bold text-white' }, 'Health Timeline'),
            trend !== 0 && h('div', {
                className: cn(
                    'flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full',
                    trend > 0 ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                )
            },
                h('span', {}, trend > 0 ? '↑' : '↓'),
                h('span', {}, `${Math.abs(trend).toFixed(0)} pts`)
            )
        ),

        // Chart
        h('div', { className: 'bg-zinc-900/50 rounded-lg p-4 border border-zinc-800' },
            h('svg', {
                width: '100%',
                height: height,
                viewBox: `0 0 ${width} ${height}`,
                className: 'overflow-visible'
            },
                // Grid lines
                [0, 25, 50, 75, 100].map(score =>
                    h('line', {
                        key: `grid-${score}`,
                        x1: padding.left,
                        y1: padding.top + chartHeight - (score / 100) * chartHeight,
                        x2: padding.left + chartWidth,
                        y2: padding.top + chartHeight - (score / 100) * chartHeight,
                        stroke: '#27272a',
                        strokeWidth: 1,
                        strokeDasharray: '2,2'
                    })
                ),

                // Y-axis labels
                [0, 50, 100].map(score =>
                    h('text', {
                        key: `y-label-${score}`,
                        x: padding.left - 10,
                        y: padding.top + chartHeight - (score / 100) * chartHeight + 4,
                        fill: '#71717a',
                        fontSize: 10,
                        textAnchor: 'end'
                    }, score)
                ),

                // Line path
                h('path', {
                    d: pathData,
                    fill: 'none',
                    stroke: '#10b981',
                    strokeWidth: 2,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round'
                }),

                // Area under line
                h('path', {
                    d: `${pathData} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`,
                    fill: 'url(#gradient)',
                    opacity: 0.2
                }),

                // Gradient definition
                h('defs', {},
                    h('linearGradient', { id: 'gradient', x1: '0', x2: '0', y1: '0', y2: '1' },
                        h('stop', { offset: '0%', stopColor: '#10b981' }),
                        h('stop', { offset: '100%', stopColor: '#10b981', stopOpacity: 0 })
                    )
                ),

                // Data points
                points.map((point, idx) =>
                    h('circle', {
                        key: `point-${idx}`,
                        cx: point.x,
                        cy: point.y,
                        r: 3,
                        fill: '#10b981',
                        stroke: '#18181b',
                        strokeWidth: 2,
                        className: 'cursor-pointer hover:r-5 transition-all'
                    },
                        h('title', {}, `${formatDate(point.timestamp)}: ${point.healthScore}%`)
                    )
                )
            )
        ),

        // Stats summary
        h('div', { className: 'grid grid-cols-3 gap-3 text-center' },
            h('div', { className: 'bg-zinc-900/30 rounded p-2' },
                h('div', { className: 'text-xs text-gray-500 uppercase tracking-wider' }, 'Current'),
                h('div', { className: 'text-lg font-bold text-white' }, `${recentData[recentData.length - 1].healthScore}%`)
            ),
            h('div', { className: 'bg-zinc-900/30 rounded p-2' },
                h('div', { className: 'text-xs text-gray-500 uppercase tracking-wider' }, 'Weak'),
                h('div', { className: 'text-lg font-bold text-yellow-500' }, recentData[recentData.length - 1].weakCount)
            ),
            h('div', { className: 'bg-zinc-900/30 rounded p-2' },
                h('div', { className: 'text-xs text-gray-500 uppercase tracking-wider' }, 'Reused'),
                h('div', { className: 'text-lg font-bold text-red-500' }, recentData[recentData.length - 1].reuseCount)
            )
        )
    );
};
