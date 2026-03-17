import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

function daysBetween(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get('authorization');
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const stats = {
      rentRemindersSent: 0,
      overdueRemindersSent: 0,
      leaseExpiryWarningsSent: 0,
      rentIncrementsApplied: 0,
      errors: [] as string[],
    };

    const ownersSnap = await adminDb.collection('users')
      .where('role', '==', 'owner')
      .get();

    for (const ownerDoc of ownersSnap.docs) {
      const ownerId = ownerDoc.id;

      const buildingsSnap = await adminDb.collection('buildings')
        .where('ownerId', '==', ownerId)
        .where('isActive', '==', true)
        .get();

      for (const buildingDoc of buildingsSnap.docs) {
        const buildingId = buildingDoc.id;
        const building = buildingDoc.data();

        const tenantsSnap = await adminDb.collection('tenants')
          .where('currentBuildingId', '==', buildingId)
          .where('leaseStatus', '==', 'active')
          .get();

        for (const tenantDoc of tenantsSnap.docs) {
          const tenant = tenantDoc.data();
          const tenantId = tenantDoc.id;

          const tenantUserDoc = await adminDb.collection('users').doc(tenantId).get();
          const tenantUser = tenantUserDoc.data();
          const tenantEmail = tenantUser?.email;

          if (!tenant.currentLeaseId) continue;

          const leaseDoc = await adminDb.collection('leases').doc(tenant.currentLeaseId).get();
          const lease = leaseDoc.data();

          if (!lease) continue;

          const currentMonth = now.getMonth() + 1;
          const currentYear = now.getFullYear();

          const billsSnap = await adminDb.collection('bills')
            .where('tenantId', '==', tenantId)
            .where('month', '==', currentMonth)
            .where('year', '==', currentYear)
            .limit(1)
            .get();

          if (!billsSnap.empty) {
            const bill = billsSnap.docs[0].data();
            const billRef = billsSnap.docs[0].ref;

            if (bill.status === 'unpaid' || bill.status === 'partial') {
              const dueDate = bill.dueDate?.toDate ? bill.dueDate.toDate() : new Date(bill.dueDate);
              const daysUntilDue = daysBetween(now, dueDate);
              const daysOverdue = daysBetween(dueDate, now);

              const sentReminders = bill.sentReminders || [];

              if (daysUntilDue === 7 && !sentReminders.includes('due_7')) {
                await adminDb.collection('notifications').add({
                  userId: tenantId,
                  type: 'rent_due',
                  title: 'Rent due in 7 days',
                  message: `Your rent of ₹${bill.totalAmount} is due in 7 days`,
                  isRead: false,
                  link: '/bills',
                  createdAt: FieldValue.serverTimestamp(),
                });
                await billRef.update({
                  sentReminders: FieldValue.arrayUnion('due_7'),
                });
                stats.rentRemindersSent++;
              }

              if (daysUntilDue === 3 && !sentReminders.includes('due_3')) {
                await adminDb.collection('notifications').add({
                  userId: tenantId,
                  type: 'rent_due',
                  title: 'Rent due in 3 days',
                  message: `Your rent of ₹${bill.totalAmount} is due in 3 days`,
                  isRead: false,
                  link: '/bills',
                  createdAt: FieldValue.serverTimestamp(),
                });
                await billRef.update({
                  sentReminders: FieldValue.arrayUnion('due_3'),
                });
                stats.rentRemindersSent++;
              }

              if (daysUntilDue <= 0 && !sentReminders.includes('due_today')) {
                await adminDb.collection('notifications').add({
                  userId: tenantId,
                  type: 'rent_due',
                  title: 'Rent due today',
                  message: `Your rent of ₹${bill.totalAmount} is due today`,
                  isRead: false,
                  link: '/bills',
                  createdAt: FieldValue.serverTimestamp(),
                });
                await billRef.update({
                  sentReminders: FieldValue.arrayUnion('due_today'),
                });
                stats.rentRemindersSent++;
              }

              if (daysOverdue === 1 && !sentReminders.includes('overdue_1')) {
                await adminDb.collection('notifications').add({
                  userId: tenantId,
                  type: 'overdue',
                  title: 'Rent overdue',
                  message: `Your rent of ₹${bill.totalAmount} is 1 day overdue`,
                  isRead: false,
                  link: '/bills',
                  createdAt: FieldValue.serverTimestamp(),
                });
                await billRef.update({
                  sentReminders: FieldValue.arrayUnion('overdue_1'),
                });
                stats.overdueRemindersSent++;
              }

              if (daysOverdue === 3 && !sentReminders.includes('overdue_3')) {
                await adminDb.collection('notifications').add({
                  userId: tenantId,
                  type: 'overdue',
                  title: 'Rent 3 days overdue',
                  message: `Your rent of ₹${bill.totalAmount} is 3 days overdue`,
                  isRead: false,
                  link: '/bills',
                  createdAt: FieldValue.serverTimestamp(),
                });
                await billRef.update({
                  sentReminders: FieldValue.arrayUnion('overdue_3'),
                });
                stats.overdueRemindersSent++;
              }

              if (daysOverdue === 7 && !sentReminders.includes('overdue_7')) {
                await adminDb.collection('notifications').add({
                  userId: tenantId,
                  type: 'overdue',
                  title: 'Rent 7 days overdue',
                  message: `Your rent of ₹${bill.totalAmount} is 7 days overdue. Late fees may apply.`,
                  isRead: false,
                  link: '/bills',
                  createdAt: FieldValue.serverTimestamp(),
                });
                await billRef.update({
                  sentReminders: FieldValue.arrayUnion('overdue_7'),
                });
                stats.overdueRemindersSent++;
              }
            }
          }

          if (lease.endDate) {
            const endDate = lease.endDate.toDate ? lease.endDate.toDate() : new Date(lease.endDate);
            const daysUntilExpiry = daysBetween(now, endDate);

            const sentExpiryReminders = lease.sentExpiryReminders || [];

            if (daysUntilExpiry === 60 && !sentExpiryReminders.includes('expiry_60')) {
              await adminDb.collection('notifications').add({
                userId: tenantId,
                type: 'lease_expiry',
                title: 'Lease expires in 60 days',
                message: `Your lease expires on ${endDate.toLocaleDateString()}. Please contact the owner to renew.`,
                isRead: false,
                link: '/lease',
                createdAt: FieldValue.serverTimestamp(),
              });
              await adminDb.collection('notifications').add({
                userId: ownerId,
                type: 'lease_expiry',
                title: `Lease expiring in 60 days`,
                message: `${tenant.name || 'Tenant'}'s lease expires on ${endDate.toLocaleDateString()}`,
                isRead: false,
                link: `/tenants/${tenantId}`,
                createdAt: FieldValue.serverTimestamp(),
              });
              await leaseDoc.ref.update({
                sentExpiryReminders: FieldValue.arrayUnion('expiry_60'),
              });
              stats.leaseExpiryWarningsSent++;
            }

            if (daysUntilExpiry === 30 && !sentExpiryReminders.includes('expiry_30')) {
              await adminDb.collection('notifications').add({
                userId: tenantId,
                type: 'lease_expiry',
                title: 'Lease expires in 30 days',
                message: `Your lease expires on ${endDate.toLocaleDateString()}. Please contact the owner to renew.`,
                isRead: false,
                link: '/lease',
                createdAt: FieldValue.serverTimestamp(),
              });
              await leaseDoc.ref.update({
                sentExpiryReminders: FieldValue.arrayUnion('expiry_30'),
              });
              stats.leaseExpiryWarningsSent++;
            }

            if (daysUntilExpiry === 7 && !sentExpiryReminders.includes('expiry_7')) {
              await adminDb.collection('notifications').add({
                userId: tenantId,
                type: 'lease_expiry',
                title: 'Lease expires in 7 days',
                message: `Your lease expires on ${endDate.toLocaleDateString()}. Please contact the owner immediately.`,
                isRead: false,
                link: '/lease',
                createdAt: FieldValue.serverTimestamp(),
              });
              await leaseDoc.ref.update({
                sentExpiryReminders: FieldValue.arrayUnion('expiry_7'),
              });
              stats.leaseExpiryWarningsSent++;
            }
          }
        }
      }

      const incrementsSnap = await adminDb.collection('rentIncrements')
        .where('ownerId', '==', ownerId)
        .where('isApplied', '==', false)
        .get();

      for (const incrementDoc of incrementsSnap.docs) {
        const increment = incrementDoc.data();
        const effectiveDate = increment.effectiveDate.toDate ? increment.effectiveDate.toDate() : new Date(increment.effectiveDate);
        const daysUntil = daysBetween(now, effectiveDate);

        if (effectiveDate <= now) {
          await adminDb.collection('leases').doc(increment.leaseId).update({
            rentAmount: increment.newAmount,
            updatedAt: FieldValue.serverTimestamp(),
          });

          await incrementDoc.ref.update({
            isApplied: true,
            appliedAt: FieldValue.serverTimestamp(),
          });

          await adminDb.collection('notifications').add({
            userId: increment.tenantId,
            type: 'rent_increment',
            title: 'Rent updated',
            message: `Your rent has been updated to ₹${increment.newAmount.toLocaleString()} from today.`,
            isRead: false,
            link: '/lease',
            createdAt: FieldValue.serverTimestamp(),
          });

          stats.rentIncrementsApplied++;
        } else if (daysUntil === 30 && !increment.sentAdvanceNotice) {
          await adminDb.collection('notifications').add({
            userId: increment.tenantId,
            type: 'rent_increment',
            title: 'Upcoming rent change',
            message: `Your rent will increase to ₹${increment.newAmount.toLocaleString()} from ${effectiveDate.toLocaleDateString()}.`,
            isRead: false,
            link: '/lease',
            createdAt: FieldValue.serverTimestamp(),
          });

          await incrementDoc.ref.update({
            sentAdvanceNotice: true,
          });
        } else if (daysUntil === 7 && !increment.sentFinalNotice) {
          await adminDb.collection('notifications').add({
            userId: increment.tenantId,
            type: 'rent_increment',
            title: 'Rent change reminder',
            message: `Your rent will increase to ₹${increment.newAmount.toLocaleString()} from ${effectiveDate.toLocaleDateString()}. One week remaining.`,
            isRead: false,
            link: '/lease',
            createdAt: FieldValue.serverTimestamp(),
          });

          await incrementDoc.ref.update({
            sentFinalNotice: true,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cron completed successfully',
      stats,
    });
  } catch (error) {
    console.error('Error in reminders cron:', error);
    return NextResponse.json({ error: 'Failed to run reminders cron' }, { status: 500 });
  }
}
