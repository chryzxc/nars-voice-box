import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buildFullName, eventHasPassed } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import moment from 'moment';

const DialogLabelValue = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-md">{value}</p>
  </div>
);

const AppointmentModal = ({ open, onOpenChange, onEdit, onComplete, data }) => {
  if (!data) return null;
  return (
    <Dialog {...{ open, onOpenChange }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{data?.patientName}</DialogTitle>
        </DialogHeader>
        <DialogLabelValue
          label="Doctor"
          value={buildFullName({
            firstName: data?.doctor.firstName,
            lastName: data?.doctor.lastName,
            middleName: data?.doctor.middleName,
          })}
        />
        <DialogLabelValue
          label="Nurse"
          value={buildFullName({
            firstName: data?.creator.firstName,
            lastName: data?.creator.lastName,
            middleName: data?.creator.middleName,
          })}
        />
        <DialogLabelValue
          label="Schedule date"
          value={`${moment(data?.date).format('MMMM DD, YYYY')} (${
            data?.time
          })`}
        />
        <DialogLabelValue
          label="Patient address"
          value={data?.patientAddress}
        />{' '}
        <DialogLabelValue
          label="Patient contact info"
          value={data?.patientContactInformation}
        />
        <DialogLabelValue label="Notes" value={data?.notes} />
        <DialogLabelValue
          label="Created"
          value={moment(data?.createdAt).format('MMMM DD,YYYY hh:mm a')}
        />
        <div className="flex flex-col gap-2">
          <Button onClick={onEdit} className="bg-primary">
            Edit
          </Button>
          {eventHasPassed(data?.date) && (
            <Button onClick={onComplete} className="bg-secondary">
              Mark as done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
