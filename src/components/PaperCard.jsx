import React from 'react';
import PaperListItem from './PaperListItem';

// Backward compatible wrapper rendering modern List View row
export default function PaperCard(props) {
  return <PaperListItem {...props} />;
}
