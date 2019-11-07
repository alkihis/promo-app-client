import React from 'react';
import classes from './TeacherStudents.module.scss';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { DashboardContainer } from '../../shared/Dashboard/Dashboard';
import { Student } from '../../../interfaces';
import APIHELPER from '../../../APIHelper';
import { BigPreloader, ClassicModal } from '../../../helpers';
import { toast } from '../../shared/Toaster/Toaster';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { Link } from 'react-router-dom';
import { IconButton } from '@material-ui/core';

type TSState = {
  page: number;
  rows_count: number;
  rows: Data[] | undefined | null;
  delete_modal_open: false | null | number;
}

export default class TeacherStudents extends React.Component<{}, TSState> {
  state: TSState = {
    page: 0,
    rows_count: 25,
    rows: undefined,
    delete_modal_open: false,
  };

  componentDidMount() {
    APIHELPER.request('student/all')
      .then((students: Student[]) => {
        this.setState({
          rows: students
        });
      })
      .catch(() => {
        toast('Impossible de charger les données. Réessayez ultérieurement.', 'error');
        this.setState({
          rows: null
        });
      });
  }

  handleChangePage = (_: unknown, new_page: number) => {
    this.setState({
      page: new_page
    });
  };

  handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      page: 0,
      rows_count: +event.target.value
    });
  };

  handleClose = () => {
    this.setState({
      delete_modal_open: false
    });
  }

  handleOpen = (id_etu: number) => {
    this.setState({
      delete_modal_open: id_etu
    });
  }

  handleDeleteConfirm = async () => {
    if (this.state.delete_modal_open === null)
      return;

    /// TODO DO DELETE REQUEST
    const id = this.state.delete_modal_open as number;
    this.setState({
      delete_modal_open: null
    });

    let rows = this.state.rows as Data[];
    
    try {
      await APIHELPER.request('student/' + String(id), { method: 'DELETE' });

      // Supprime du tableau de lignes l'étudiant supprimé
      rows = rows.filter(r => r.id !== id);
      toast("L'étudiant a été supprimé", "success");

    } catch (e) {
      toast("Impossible de supprimer l'étudiant.", "error");
    }

    this.setState({
      delete_modal_open: false,
      rows: rows
    });
  }

  loader() {
    return <BigPreloader style={{ marginTop: '5rem' }} />;
  }

  errorMsg() {
    return (
      <div>
        Impossible de charger les données.
      </div>
    );
  }

  editButton(id_etu: number) {
    return (
      <Link to={"/teacher/dashboard/" + String(id_etu)}>
        <IconButton size="small">
          <EditIcon />
        </IconButton>
      </Link>
    );
  }

  deleteButton(id_etu: number) {
    return (
      <IconButton size="small" onClick={() => this.handleOpen(id_etu)}>
        <DeleteIcon />
      </IconButton>
    );
  }

  render() {
    if (this.state.rows === undefined) {
      return this.loader();
    }
    else if (this.state.rows === null) {
      return this.errorMsg();
    }

    const rows = this.state.rows!.slice(
      this.state.page * this.state.rows_count, 
      this.state.page * this.state.rows_count + this.state.rows_count
    ).map(row => {
      const trs = columns.map(column => {
        // @ts-ignore
        const value = row[column.id];
        return (
          <TableCell key={column.id} align={column.align}>
            {column.format ? column.format(value) : value}
          </TableCell>
        );
      });

      trs.unshift(
        <TableCell key={"editdelete"} className={classes.buttons}>
          {this.editButton(row.id)} {this.deleteButton(row.id)}
        </TableCell>
      );
      
      return (
        <TableRow 
          hover 
          role="checkbox" 
          tabIndex={-1} 
          key={row.id}
        >
          {trs}
        </TableRow>
      );
    });

    const cols = columns.map(column => (
      <TableCell
        key={column.id}
        align={column.align}
        style={{ minWidth: column.minWidth }}
      >
        {column.label}
      </TableCell>
    ));
    cols.unshift(
      <TableCell
        key={"editdelete"}
      />
    );

    return (
      <DashboardContainer>
        <ClassicModal 
          text="Supprimer cet étudiant ?" 
          explaination="L'étudiant sera irrémédiablement supprimé de la base de données." 
          validateText="Supprimer"
          open={!(this.state.delete_modal_open === false)}
          onCancel={this.handleClose}
          onClose={this.handleClose}
          onValidate={this.handleDeleteConfirm}
        />

        <Paper className={classes.root}>
          <div className={classes.tableWrapper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {cols}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={this.state.rows!.length}
            rowsPerPage={this.state.rows_count}
            page={this.state.page}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Paper>
      </DashboardContainer>
    );
  }
}

interface Column {
  id: keyof Student | "graduated";
  label: string;
  minWidth?: number;
  align?: "left" | "right";
  format?: (value: any) => string;
}

const columns: Column[] = [
  { id: 'last_name', label: 'Nom', minWidth: 120 },
  { id: 'first_name', label: 'Prénom', minWidth: 120 },
  { id: 'year_in', label: 'Année d\'entrée', minWidth: 60 },
  { id: 'graduated', label: 'Diplômé', minWidth: 50, format: (v: boolean) => v ? "Oui" : "Non" },
  { id: 'email', label: 'E-mail', minWidth: 230 },
];

interface Data {
  id: number;
  last_name: string;
  first_name: string;
  year_in: string;
  graduated: boolean;
  email: string;
} 

