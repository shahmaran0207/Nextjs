import { prisma } from './lib/prisma';
prisma.link_speed_history.groupBy({ by: ['link_id'], _count: { link_id: true } })
  .then(res => console.log('Stored links count:', res.length, 'Example:', res[0]?.link_id))
  .catch(console.error)
  .finally(() => console.log('done'));
