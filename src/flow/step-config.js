const props = Object.freeze({
  audience_build_wi: {
    name: 'Audience Build',
    sub: 'Walk-in',
    level: 0,
  },
  audience_build_beacon: {
    name: 'Audience Build',
    sub: 'Beacon',
    level: 0,
  },
  preprocess: {
    name: 'Pre-process',
    level: 0,
  },
  audience_enrich_aoi: {
    name: 'Enrichment',
    sub: 'AOI',
    level: 1,
  },
  audience_enrich_xd: {
    name: 'Enrichment',
    sub: 'Cross Device',
    level: 1,
  },
  lookalike_app: {
    name: 'Look Alike',
    sub: 'App',
    level: 1,
  },
  lookalike_geo: {
    name: 'Look Alike',
    sub: 'Geo',
    level: 1,
  },
  audience_intersect_vwi: {
    name: 'Intersection',
    sub: 'Verified Walk-in',
    level: 2,
  },
  audience_intersect_xwi: {
    name: 'Intersection',
    sub: 'Cross Chain Walk-in',
    level: 2,
  },
  target_control: {
    name: 'Target Control',
    level: 2,
  },
  segment: {
    name: 'Segment',
    level: 3,
  },
  cohort_repeat_visits: {
    name: 'Cohort Analysis',
    sub: 'Visits',
    level: 3,
  },
  cohort_converted_visitors: {
    name: 'Cohort Analysis',
    sub: 'Converted Visitors',
    level: 3,
  },
  propensity: {
    name: 'Propensity',
    level: 3,
  },
  report_wi: {
    name: 'Report',
    sub: 'Walk-in',
    level: 3,
  },
  report_vwi: {
    name: 'Report',
    sub: 'Verified Walk-in',
    level: 3,
  },
  report_xwi: {
    name: 'Report',
    sub: 'Cross Chain Walk-in',
    level: 3,
  },
  trigger_initial: {
    name: 'Trigger Initial',
    level: 3,
  },
  geo_cohort: {
    name: 'Geo Cohort',
    level: 4,
  },
})

const stepConfig = {
  props,
  relations: [
    {
      match: (stepName) => stepName.startsWith('audience_enrich_'),
      src: ['ori_audience'],
    },
    {
      match: (stepName) => stepName.startsWith('audience_intersect_'),
      src: ['pri_audience', 'sec_audience'],
    },
    {
      match: ['segment', 'propensity'],
      src: ['audience_id'],
    },
    {
      match: ['geo_cohort'],
      src: ['report', 'audience_id'],
      findSrcNode: ({ data, src, srcType }) => {
        return srcType === 'report' 
          ? data.parameters.report === src 
          : data.parameters.audience_id === src
      },
    },
    {
      match: (stepName) => stepName.startsWith('report_'),
      src: ['walkin_audid', 'beacon_audid', 'conversion_audid'],
    },
    {
      match: 'cohort_repeat_visits',
      src: ['visit_audience'],
    },
    {
      match: 'cohort_converted_visitors',
      src: ['visit_audience', 'beacon_audience'],
    },
    {
      match: ['propensity', 'cohort_repeat_visits', 'cohort_converted_visitors'],
      src: ['report'],
      findSrcNode: ({ data, src }) => data.name.startsWith('report_') && data.parameters.report === src,
    },
  ],
}

export default stepConfig
