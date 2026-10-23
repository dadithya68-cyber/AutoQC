async function runTest() {
  const payload = {
    vin: '1G6AL5SX8M0100912',
    vehicle_id: 'veh-001',
    line_id: 'line-assembly',
    station_id: 'station-3',
    component: 'Front Left Headlight Seal',
    category: 'DIMENSIONAL',
    severity: 'MINOR',
    description: 'Slight gap variation on optical cluster',
    coordinates: { x: 45, y: 50, view: 'front', zone: 'BUMPER_FRONT' },
    shift: 'Shift A (Morning)',
    logged_by: 'QA Inspector Test'
  };

  const res = await fetch('http://localhost:5000/api/defects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log('API Defect Response:', data.success ? `Defect ${data.data.id} Created Successfully` : data);

  // Check database status
  const dbRes = await fetch('http://localhost:5000/api/database/status');
  const dbData = await dbRes.json();
  console.log('Database Persistence Status:', dbData.data);
}

runTest();
