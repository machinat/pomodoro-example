import Machinat, { MachinatNode } from '@machinat/core';
import { ACTION_OK, ACTION_NO } from '../constant';
import ButtonsCard from './ButtonsCard';

type StopingCardProps = {
  children: MachinatNode;
};

const StopingCard = ({ children }: StopingCardProps) => {
  return (
    <ButtonsCard
      buttons={[
        { type: 'action', text: 'Yes', action: ACTION_OK },
        { type: 'action', text: 'No', action: ACTION_NO },
      ]}
      makeLineAltText={(template) => template.text as string}
    >
      {children}
    </ButtonsCard>
  );
};

export default StopingCard;
