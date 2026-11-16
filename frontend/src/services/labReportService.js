// MOCK: no upload, no network. The file never leaves the browser.
// Replace the body of analyzeReport() with a real API call later; keep the return shape.
export const analyzeReport = (file) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        fileName: file.name,
        summary: 'Most values are in the normal range. Hemoglobin is slightly low and LDL cholesterol is slightly high.',
        values: [
          { name: 'Hemoglobin', value: '11.8 g/dL', range: '12.0 - 15.5', status: 'low' },
          { name: 'White blood cells', value: '6,800 /uL', range: '4,000 - 11,000', status: 'normal' },
          { name: 'Platelets', value: '245,000 /uL', range: '150,000 - 450,000', status: 'normal' },
          { name: 'Fasting glucose', value: '92 mg/dL', range: '70 - 99', status: 'normal' },
          { name: 'LDL cholesterol', value: '138 mg/dL', range: '< 100', status: 'high' },
          { name: 'Vitamin D', value: '34 ng/mL', range: '30 - 100', status: 'normal' },
        ],
        insights: [
          'Slightly low hemoglobin can be linked to low iron intake. Iron-rich foods may help.',
          'Elevated LDL cholesterol is worth discussing, along with diet and activity.',
          'Your blood sugar and vitamin D levels look healthy.',
        ],
        suggestedSpeciality: 'General physician',
      })
    }, 2200)
  })
