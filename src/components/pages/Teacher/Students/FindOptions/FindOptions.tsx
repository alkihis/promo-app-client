import React from 'react';
import { Badge, Grid, Select, FormControl, InputLabel, MenuItem, Dialog, DialogContent, IconButton, DialogActions, Button, DialogTitle, Input, useTheme } from "@material-ui/core";
import FilterIcon from '@material-ui/icons/FilterList';
import classes from './FindOptions.module.scss';
import { StudentFilters } from '../../../../../utils/helpers';
import { toast } from '../../../../shared/Toaster/Toaster';
import { Student } from '../../../../../interfaces';

function generateYearSince(year: string | number) {
  year = Number(year);
  const current = (new Date()).getFullYear();

  const years: string[] = [];

  for (let i = current; i >= year; i--) {
    years.push(String(i));
  }

  return years;
}

const FindOptions: React.FC<{ onChange?: (filters: StudentFilters) => void, students: Student[] | undefined }> = props => {
  const [graduated, setGraduated] = React.useState('undefined');
  const [yearIn, setYearIn] = React.useState('undefined');
  const [yearOut, setYearOut] = React.useState('undefined');
  const [atWork, setAtWork] = React.useState('undefined');
  const [inMaster, setInMaster] = React.useState('undefined');
  const [companies, setCompanies] = React.useState([] as string[]);
  const [inactiveSince, setInactiveSince] = React.useState('undefined');
  const [haveNext, setHaveNext] = React.useState('undefined');
  const [withThesis, setWithThesis] = React.useState('undefined');
  const [withInternship, setWithInternship] = React.useState('undefined');
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();

  const current_companies = new Set<string>();
  if (props.students) {
    for (const student of props.students) {
      if (student.jobs) {
        for (const job of student.jobs) {
          current_companies.add(job.company.name);
        }
      }
      if (student.internships) {
        for (const internship of student.internships) {
          current_companies.add(internship.company.name);
        }
      }
    }
  }

  function getNumberOfActiveFilters() {
    return [graduated, yearIn, yearOut, atWork, inMaster, inactiveSince, haveNext, withThesis].filter(e => e !== 'undefined').length;
  }

  function undefinedOrBool(value: string) {
    if (value === 'undefined') {
      return undefined;
    }
    return value === 'true';
  }
  
  function undefinedOrString(value: string) {
    return value === 'undefined' ? undefined : value;
  }

  function undefinedOrArray(arr: any[]) {
    if (arr.length) {
      return arr;
    }
    return undefined;
  }

  function onClose() {
    setOpen(false);
  }

  function reset() {
    setGraduated('undefined');
    setWithThesis('undefined');
    setHaveNext('undefined');
    setInactiveSince('undefined');
    setInMaster('undefined');
    setAtWork('undefined');
    setYearOut('undefined');
    setYearIn('undefined');
  }

  function getStyles(name: string, personName: string[]) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  React.useEffect(() => {
    const filters: StudentFilters = {
      graduated: undefinedOrBool(graduated),
      at_work: undefinedOrBool(atWork),
      in_master: undefinedOrBool(inMaster),
      have_next_formation: undefinedOrBool(haveNext),
      with_thesis: undefinedOrBool(withThesis),
      year: {
        in: undefinedOrString(yearIn),
        out: undefinedOrString(yearOut)
      },
      inactive_since: inactiveSince === 'undefined' ? undefined : Number(inactiveSince),
      in_companies: undefinedOrArray(companies),
      with_internship: undefinedOrBool(withInternship),
    };

    props.onChange?.(filters);

    // eslint-disable-next-line
  }, [graduated, yearIn, yearOut, atWork, inMaster, inactiveSince, haveNext, withThesis, companies, withInternship]);
  
  const actives_filters = getNumberOfActiveFilters();

  return (
    <div className={classes.container}>
      <IconButton onClick={() => setOpen(true)} className={classes.margin}>
        {actives_filters ? 
          <Badge className={classes.margin} badgeContent={actives_filters} color="primary">
            <FilterIcon />
          </Badge> : 
          <FilterIcon />
        }
      </IconButton>

      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Filtres
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            {/* Year In */}
            <Grid item xs={12} lg={6}>
              <FormControl className={classes.control_wrapper}>
                <InputLabel id="year-in-filter">Année d'entrée dans le master</InputLabel>
                <Select
                  labelId="year-in-filter"
                  value={yearIn}
                  onChange={evt => {
                    const year = evt.target.value as string;
                    if (year !== 'undefined' && yearOut !== 'undefined') {
                      if (Number(yearOut) < Number(year)) {
                        setYearOut('undefined');
                      }
                    }

                    setYearIn(year);
                  }}
                >
                  <MenuItem value="undefined">Toutes</MenuItem>
                  {generateYearSince(2015).map(year => <MenuItem value={year} key={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* Year Out */}
            <Grid item xs={12} lg={6}>
              <FormControl className={classes.control_wrapper}>
                <InputLabel id="year-out-filter">Année de sortie du master</InputLabel>
                <Select
                  labelId="year-out-filter"
                  value={yearOut}
                  onChange={evt => {
                    setYearOut(evt.target.value as string);
                  }}
                >
                  <MenuItem value="undefined">Toutes</MenuItem>
                  {
                    generateYearSince(yearIn !== 'undefined' ? Number(yearIn) + 1 : 2015)
                      .map(year => <MenuItem value={year} key={year}>{year}</MenuItem>)
                  }
                </Select>
              </FormControl>
            </Grid>

            {/* Graduated */}
            <Grid item xs={12} lg={6}>
              <FormControl className={classes.control_wrapper}>
                <InputLabel id="graduated-filter">Diplômé</InputLabel>
                <Select
                  labelId="graduated-filter"
                  value={graduated}
                  onChange={evt => {
                    setGraduated(evt.target.value as string);
                  }}
                >
                  <MenuItem value="undefined">Tous</MenuItem>
                  <MenuItem value="true">Oui</MenuItem>
                  <MenuItem value="false">Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* At work */}
            <Grid item xs={12} lg={6}>
              <FormControl className={classes.control_wrapper}>
                <InputLabel id="at-work-filter">Actuellement avec un emploi</InputLabel>
                <Select
                  labelId="at-work-filter"
                  value={atWork}
                  onChange={evt => {
                    setAtWork(evt.target.value as string);
                  }}
                >
                  <MenuItem value="undefined">Tous</MenuItem>
                  <MenuItem value="true">Oui</MenuItem>
                  <MenuItem value="false">Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* At internship */}
            <Grid item xs={12} lg={6}>
              <FormControl className={classes.control_wrapper}>
                <InputLabel id="at-work-filter">Actuellement en stage</InputLabel>
                <Select
                  labelId="at-work-filter"
                  value={withInternship}
                  onChange={evt => {
                    setWithInternship(evt.target.value as string);
                  }}
                >
                  <MenuItem value="undefined">Tous</MenuItem>
                  <MenuItem value="true">Oui</MenuItem>
                  <MenuItem value="false">Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Which company */}
            <Grid item xs={12} lg={6}>
              <FormControl className={classes.control_wrapper}>
                <InputLabel id="company-select">Travaillant/Ayant travaillé à...</InputLabel>
                <Select
                  labelId="company-select"
                  multiple
                  value={companies}
                  onChange={evt => {
                    setCompanies(evt.target.value as string[]);
                  }}
                  input={<Input />}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5 + 8,
                      },
                    }
                  }}
                >
                  {[...current_companies].map(name => (
                    <MenuItem key={name} value={name} style={getStyles(name, companies)}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* With thesis */}
            <Grid item xs={12} lg={6}>
              <FormControl className={classes.control_wrapper}>
                <InputLabel id="thesis-filter">Étudiant ayant fait / parti en thèse</InputLabel>
                <Select
                  labelId="thesis-filter"
                  value={withThesis}
                  onChange={evt => {
                    setWithThesis(evt.target.value as string);
                  }}
                >
                  <MenuItem value="undefined">Tous</MenuItem>
                  <MenuItem value="true">Oui</MenuItem>
                  <MenuItem value="false">Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Have reorientation */}
            <Grid item xs={12} lg={6}>
            <FormControl className={classes.control_wrapper}>
                <InputLabel id="have-next-filter">Étudiant réorienté après le master</InputLabel>
                <Select
                  labelId="have-next-filter"
                  value={haveNext}
                  onChange={evt => {
                    setHaveNext(evt.target.value as string);
                  }}
                >
                  <MenuItem value="undefined">Tous</MenuItem>
                  <MenuItem value="true">Oui</MenuItem>
                  <MenuItem value="false">Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* In master */}
            <Grid item xs={12} lg={6}>
              <FormControl className={classes.control_wrapper}>
                <InputLabel id="in-master-filter">Actuellement dans le master</InputLabel>
                <Select
                  labelId="in-master-filter"
                  value={inMaster}
                  onChange={evt => {
                    setInMaster(evt.target.value as string);
                  }}
                >
                  <MenuItem value="undefined">Tous</MenuItem>
                  <MenuItem value="true">Oui</MenuItem>
                  <MenuItem value="false">Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Inactive since */}
            <Grid item xs={12} lg={6}>
              <FormControl className={classes.control_wrapper}>
                <InputLabel id="inactive-filter">N'ayant entré aucune information depuis</InputLabel>
                <Select
                  labelId="inactive-filter"
                  value={inactiveSince}
                  onChange={evt => {
                    setInactiveSince(evt.target.value as string);
                  }}
                >
                  <MenuItem value="undefined">/</MenuItem>
                  <MenuItem value="1">1 mois</MenuItem>
                  <MenuItem value="3">3 mois</MenuItem>
                  <MenuItem value="6">6 mois</MenuItem>
                  <MenuItem value="12">12 mois</MenuItem>
                  <MenuItem value="24">24 mois</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button className="button-green" onClick={() => {
            props.onChange?.({});
            reset();
            toast("Filtres réinitialisés.");
          }}>
            Réinitialiser
          </Button>

          <Button color="primary" onClick={onClose}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FindOptions;
