import { useMemo } from 'react';
import { Box, Card, Checkbox, Chip, Divider, FormControlLabel, Input } from '@mui/material';
import { Search as SearchIcon } from '../../../icons/search';
import { MultiSelect } from '../../multi-select';

const typeOptions = [
  {
    label: 'Freelance',
    value: 'freelance'
  },
  {
    label: 'Full Time',
    value: 'fullTime'
  },
  {
    label: 'Part Time',
    value: 'partTime'
  },
  {
    label: 'Internship',
    value: 'internship'
  }
];

const levelOptions = [
  {
    label: 'Novice',
    value: 'novice'
  },
  {
    label: 'Expert',
    value: 'expert'
  }
];



const roleOptions = [
  {
    label: 'Web Developer',
    value: 'webDeveloper'
  },
  {
    label: 'Android Developer',
    value: 'androidDeveloper'
  },
  {
    label: 'iOS Developer',
    value: 'iosDeveloper'
  }
];

export const JobsBrowseFilter = (props) => {
  const filterItems = useMemo(() => [
    {
      label: 'Type',
      field: 'type',
      value: 'freelance',
      displayValue: 'Freelance'
    },
    {
      label: 'Type',
      field: 'type',
      value: 'internship',
      displayValue: 'Internship'
    },
    {
      label: 'Level',
      field: 'level',
      value: 'novice',
      displayValue: 'Novice'
    },
    {
  
      value: 'asia',
      displayValue: 'Asia'
    },
    {
      label: 'Role',
      field: 'role',
      value: 'webDeveloper',
      displayValue: 'Web Developer'
    }
  ], []);

  // We memoize this part to prevent re-render issues
  const typeValues = useMemo(() => filterItems
    .filter((filterItems) => filterItems.field === 'type')
    .map((filterItems) => filterItems.value), [filterItems]);

  const levelValues = useMemo(() => filterItems
    .filter((filterItems) => filterItems.field === 'level')
    .map((filterItems) => filterItems.value), [filterItems]);


  const roleValues = useMemo(() => filterItems
    .filter((filterItems) => filterItems.field === 'role')
    .map((filterItems) => filterItems.value), [filterItems]);

  return (
    <Card {...props}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          p: 2
        }}
      >
        <SearchIcon fontSize="small" />
        <Box
          sx={{
            flexGrow: 1,
            ml: 3
          }}
        >
          <Input
            disableUnderline
            fullWidth
            placeholder="Enter a keyword"
          />
        </Box>
      </Box>
      <Divider />
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          p: 2
        }}
      >
        {filterItems.map((filterItem, i) => (
          <Chip
            key={i}
            label={(
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  '& span': {
                    fontWeight: 600
                  }
                }}
              >
                  <span>
                    {filterItem.label}
                  </span>
                :
                {' '}
                {filterItem.displayValue || filterItem.value}
              </Box>
            )}
            onDelete={() => { }}
            sx={{ m: 1 }}
            variant="outlined"
          />
        ))}
      </Box>
      <Divider />
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          p: 1
        }}
      >
        <MultiSelect
          label="Type"
          options={typeOptions}
          value={typeValues}
        />
        <MultiSelect
          label="Level"
          options={levelOptions}
          value={levelValues}
        />
      
        <MultiSelect
          label="Role"
          options={roleOptions}
          value={roleValues}
        />
        <Box sx={{ flexGrow: 1 }} />
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label="In network"
        />
      </Box>
    </Card>
  );
};
