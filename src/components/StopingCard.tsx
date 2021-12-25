import Machinat, { MachinatNode } from '@machinat/core';
import { ACTION_OK, ACTION_NO } from '../constant';
import ActionsCard from './ActionsCard';

type StopingCardProps = {
  children: MachinatNode;
};

const StopingCard = ({ children }: StopingCardProps) => {
  return (
    <ActionsCard
      actions={[
        { text: 'Yes', type: ACTION_OK },
        { text: 'No', type: ACTION_NO },
      ]}
      makeLineAltText={(template) => template.text as string}
    >
      {children}
    </ActionsCard>
  );
};

export default StopingCard;
