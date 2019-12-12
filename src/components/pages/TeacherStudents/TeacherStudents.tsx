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
import { Student, PartialStudent, Company, PartialJob, PartialInternship } from '../../../interfaces';
import APIHELPER from '../../../APIHelper';
import { BigPreloader, ClassicModal, studentSorter, Marger, StudentFilters, notifyError } from '../../../helpers';
import { toast } from '../../shared/Toaster/Toaster';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { Link } from 'react-router-dom';
import { IconButton, Checkbox, Button, TextField, Dialog, DialogActions, DialogContent, MenuItem, Menu, DialogTitle, DialogContentText, Hidden } from '@material-ui/core';
import EmbeddedError from '../../shared/EmbeddedError/EmbeddedError';
import StudentFindOptions from './StudentFindOptions';
import ModalSendEmail from './SendEmail';
import { BASE_API_URL } from '../../../constants';
import SETTINGS from '../../../Settings';

type TSState = {
  page: number;
  rows_count: number;
  rows: Student[] | undefined | null;
  rows_after_filter?: Student[];
  rows_after_filter_and_search?: Student[];
  delete_modal_open: false | null | number;
  checked: Set<number>;
  search_text: string;
  modal_email_select: string | false;
  modal_send_mail: Student[] | false;
  modal_send_login_mail: Student[] | false;
  modal_send_refresh_mail: Student[] | false;

  menu_select_which_mail: HTMLElement | false;
}

export default class TeacherStudents extends React.Component<{}, TSState> {
  state: TSState = {
    page: 0,
    rows_count: 25,
    rows: undefined,
    delete_modal_open: false,
    checked: new Set(),
    search_text: "",
    modal_email_select: false,
    modal_send_mail: false,
    modal_send_login_mail: false,
    modal_send_refresh_mail: false,
    menu_select_which_mail: false,
  };

  checkbox_refs: { [studentId: string]: React.RefObject<HTMLInputElement> } = {};

  componentDidMount() {
    APIHELPER.request('student/all', { parameters: { full: true } })
      .then((data: { students: PartialStudent[], companies: { [companyId: string]: Company } }) => {
        // Lie les données entre elles
        for (const s of data.students) {
          if (s.jobs)
            for (const job of s.jobs as PartialJob[]) {
              if (String(job.company as number) in data.companies) {
                job.company = data.companies[job.company as number];
              }
            }
          if (s.internships)
            for (const internship of s.internships as PartialInternship[]) {
              if (String(internship.company as number) in data.companies) {
                internship.company = data.companies[internship.company as number];
              }
            }
        }

        this.setState({
          rows: data.students as Student[]
        });
      })
      .catch(() => {
        toast('Impossible de charger les données. Réessayez ultérieurement.', 'error');
        this.setState({
          rows: null
        });
      });
  }

  checkAll = () => {
    const all_ids = this.active_rows!.map(r => r.id);

    for (const checkbox of Object.values(this.checkbox_refs)) {
      if (checkbox.current !== null) {
        checkbox.current!.checked = true;
      }
    }

    this.setState({
      checked: new Set(all_ids)
    });
  };

  uncheckAll = () => {
    for (const checkbox of Object.values(this.checkbox_refs)) {
      if (checkbox.current !== null) {
        checkbox.current!.checked = false;
      }
    }

    this.setState({
      checked: new Set()
    });
  };

  checkSome = (ids: number[]) => {
    const ids_as_set = new Set(ids);
    const all_ids = this.active_rows!.map(r => r.id).filter(i => ids_as_set.has(i));

    for (const [id, checkbox] of Object.entries(this.checkbox_refs)) {
      if (checkbox !== null) {
        if (all_ids.includes(Number(id))) {
          if (checkbox.current)
            checkbox.current.checked = true;
        }
        else {
          if (checkbox.current)
            checkbox.current.checked = false;
        }
      }
    }

    this.setState({
      checked: new Set(all_ids)
    });
  };

  searchChange = (evt: any) => {
    const search_text = evt.target.value as string;
    if (search_text && this.state.rows) {
      const search = new RegExp(search_text, "i");

      // Filtre les lignes pour avoir celles qui coincident avec le champ de texte
      const active_rows = this.active_rows_wout_search!.filter(row => {
        return !!row.email.match(search) || 
          !!(row.last_name + " " + row.first_name).match(search) ||
          !!(row.first_name + " " + row.last_name).match(search) ||
          !!row.year_in.match(search)
      });

      this.setState({
        search_text,
        rows_after_filter_and_search: active_rows
      });
    }
    else {
      this.setState({
        search_text,
        rows_after_filter_and_search: undefined
      });
    }
  };

  handleCheckStudent = (id: number, check: boolean) => {
    if (check) {
      this.setState({
        checked: new Set([...this.state.checked, id])
      });
    }
    else {
      this.state.checked.delete(id);
      this.setState({
        checked: new Set([...this.state.checked])
      });
    }
  };

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
  };

  handleOpen = (id_etu: number) => {
    this.setState({
      delete_modal_open: id_etu
    });
  };

  handleDeleteConfirm = async () => {
    if (this.state.delete_modal_open === null)
      return;

    const id = this.state.delete_modal_open as number;
    this.setState({
      delete_modal_open: null
    });

    let rows = this.state.rows as Student[];
    let active_rows = this.state.rows_after_filter_and_search;
    let active_filter = this.state.rows_after_filter;
    const selected = new Set([...this.state.checked]);
    
    try {
      await APIHELPER.request('student/' + String(id), { method: 'DELETE' });

      // Supprime du tableau de lignes l'étudiant supprimé
      rows = rows.filter(r => r.id !== id);
      selected.delete(id);

      if (active_filter)
        active_filter = active_filter.filter(r => r.id !== id)

      if (active_rows)
        active_rows = active_rows.filter(r => r.id !== id);

      toast("L'étudiant a été supprimé", "success");

    } catch (e) {
      toast("Impossible de supprimer l'étudiant.", "error");
    }

    this.setState({
      delete_modal_open: false,
      rows,
      checked: selected,
      rows_after_filter_and_search: active_rows,
      rows_after_filter: active_filter
    });
  };

  handleFilterChange = (filters: StudentFilters) => {
    if (this.state.rows) {
      this.setState({
        rows_after_filter: studentSorter(this.state.rows, filters),
        search_text: "",
        rows_after_filter_and_search: undefined,
      });
    }
  };

  exportAll = () => {
    const el = document.getElementById('form-dl-placeholder') as HTMLElement;

    const checked = [...this.state.checked].map(e => String(e)).join(',');

    el.innerHTML = `
      <form id="form-dl" method="post" action="${BASE_API_URL}teacher/export" target="_blank">
        <input type="hidden" value="${checked}" name="students">
        <input type="hidden" name="token" value="${SETTINGS.token}">
      </form>
    `;
    
    setTimeout(() => {
      (document.getElementById('form-dl') as HTMLFormElement).submit();
      el.innerHTML = "";
    }, 5);
  };

  loader() {
    return <BigPreloader style={{ marginTop: '5rem' }} />;
  }

  errorMsg() {
    return <EmbeddedError text="Impossible de charger les données." />;
  }

  editButton(id_etu: number) {
    return (
      <Link to={"/teacher/dashboard/" + String(id_etu) + "/"}>
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

  modalSendEmail() {
    return (
      !!this.state.modal_send_mail && <ModalSendEmail 
        open={true} 
        mails={this.state.modal_send_mail} 
        onClose={() => this.setState({ modal_send_mail: false })}
      />
    );
  }

  selectEmailsAndCopy() {
    (document.getElementById('modal-email-addresses') as HTMLInputElement).select();
    document.execCommand("copy");
    toast('Les adresses e-mail ont été copiées dans votre presse-papiers.');
  }

  modalSelectEmail() {
    return (
      <Dialog 
        open={!!this.state.modal_email_select} 
        onClose={() => this.setState({ modal_email_select: "" })}
      >
        {this.state.modal_email_select ? <>
          <DialogContent style={{ minWidth: '40vw' }}>
            <TextField
              style={{ width: "100%" }}
              id="modal-email-addresses" 
              value={this.state.modal_email_select}
              label="Adresses e-mail"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button 
              color="secondary" 
              onClick={this.selectEmailsAndCopy}
            >
              Copier adresses
            </Button>
            <Button onClick={() => this.setState({ modal_email_select: "" })}>
              Fermer
            </Button>
          </DialogActions>
        </> : ""}
      </Dialog>
    );
  }

  modalSendLoginEmail() {
    return <ModalAskLoginEmail 
      students={this.state.modal_send_login_mail as Student[]}
      onClose={() => this.setState({ modal_send_login_mail: false })}
      onSuccess={() => {
        this.uncheckAll();
        this.setState({ modal_send_login_mail: false })
      }}
    />
  }

  modalSendRefreshDataEmail() {
    return <ModalRefreshDataEmail 
      students={this.state.modal_send_refresh_mail as Student[]}
      onClose={() => this.setState({ modal_send_refresh_mail: false })}
      onSuccess={() => {
        this.uncheckAll();
        this.setState({ modal_send_refresh_mail: false })
      }}
    />
  }

  renderRow = (row: Student) => {
    const trs = columns.map(column => {
      // @ts-ignore
      const value = row[column.id];
      return (
        <TableCell key={column.id} align={column.align}>
          {column.format ? column.format(value) : value}
        </TableCell>
      );
    });

    let ref: any;
    if (row.id in this.checkbox_refs) {
      ref = this.checkbox_refs[row.id];
    }
    else {
      ref = this.checkbox_refs[row.id] = React.createRef<HTMLInputElement>();
    }

    // Ajoute les checkbox et boutons d'édition (ligne)
    trs.unshift(
      <TableCell key="editdelete">
        <div className={classes.buttons}>
          {this.editButton(row.id)} {this.deleteButton(row.id)}
        </div>
      </TableCell>,
      <TableCell key="checkbox">
        <Checkbox
          checked={this.state.checked.has(row.id)}
          onChange={(_: any, checked: boolean) => this.handleCheckStudent(row.id, checked)}
          ref={ref}
          value="checked_student"
        />
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
  };

  get active_rows() {
    return this.state.rows_after_filter_and_search ?? 
      this.state.rows_after_filter ??
      this.state.rows;
  }

  get active_rows_wout_search() {
    return this.state.rows_after_filter ??
      this.state.rows;
  }

  get selected_students() {
    return this.active_rows?.filter(stu => this.state.checked.has(stu.id)) ?? [];
  }

  selectedInformations() {
    const total = this.state.rows!.length;
    const filtered = this.active_rows!.length;
    const has_filter = total !== filtered;

    const selected_students = this.selected_students;
    const selected = selected_students.length;

    return (
      <div className={classes.selected_info_root}>
        <div className={classes.selected_text}>
          {total} étudiants enregistrés{has_filter ? `, ${filtered} étudiant(s) affiché(s)` : ""}.

          <br />

          {selected ?
            (selected > 1 ? `${selected} étudiants sont sélectionnés` : "1 étudiant est sélectionné")
          : "Aucun étudiant n'est sélectionné"}.
        </div>

        <div className={classes.selection_btns}>
          <Button 
            className={classes.send_mail_btn} 
            disabled={!this.state.checked.size}
            onClick={(e) => this.setState({
              menu_select_which_mail: e.currentTarget
            })}
          >
            Envoyer un e-mail...
          </Button>
          
          <Menu
            anchorEl={this.state.menu_select_which_mail || undefined}
            open={Boolean(this.state.menu_select_which_mail)}
            onClose={() => this.setState({ menu_select_which_mail: false })}
          >
            <MenuItem 
              onClick={() => this.setState({ 
                modal_send_login_mail: this.selected_students, 
                menu_select_which_mail: false
              })}
            >E-mail de connexion au profil</MenuItem>
            <MenuItem 
              onClick={() => this.setState({ 
                modal_send_refresh_mail: this.selected_students, 
                menu_select_which_mail: false
              })}
            >E-mail d'actualisation du profil</MenuItem>
            <MenuItem
              onClick={() => this.setState({ 
                modal_send_mail: this.selected_students, 
                menu_select_which_mail: false
              })}
            >E-mail personnalisé</MenuItem>
          </Menu>

          <Button 
            className={classes.clipboard_cpy_btn} 
            disabled={!this.state.checked.size}
            onClick={() => {
              const addresses = selected_students
                .map(etu => `${etu.first_name} ${etu.last_name} <${etu.email}>`)
                .join(', ');

              this.setState({
                modal_email_select: addresses
              });

              setTimeout(this.selectEmailsAndCopy, 100);
            }}
          >
            Copier les adresses
          </Button>

          <Button 
            className={classes.export_btn} 
            disabled={!this.state.checked.size}
            onClick={this.exportAll}
          >
            Exporter données
          </Button>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.rows === undefined) {
      return this.loader();
    }
    else if (this.state.rows === null) {
      return this.errorMsg();
    }

    const rows = this.active_rows!
      .slice(this.state.page * this.state.rows_count, this.state.page * this.state.rows_count + this.state.rows_count)
      .map(this.renderRow);

    const cols = columns.map(column => (
      <TableCell
        key={column.id}
        align={column.align}
        style={{ minWidth: column.minWidth }}
      >
        {column.label}
      </TableCell>
    ));

    // Calcule si on a sélectionné des étudiants ou pas
    const total = this.active_rows!.length;
    const selected_students = this.selected_students;
    const selected = selected_students.length;

    // Ajoute les checkbox et boutons (header)
    cols.unshift(
      <TableCell key={"editdelete"} />,
      <TableCell key={"checkbox"}>
        <Checkbox
          indeterminate={selected > 0 && selected !== total}
          checked={selected > 0 && selected === total}
          onChange={(_: any, checked: boolean) => checked ? this.checkAll() : this.uncheckAll()}
          value="checked_student"
        />
      </TableCell>
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

        {this.modalSelectEmail()}
        {this.modalSendEmail()}

        {this.selectedInformations()}

        {this.state.modal_send_login_mail && this.modalSendLoginEmail()}
        {this.state.modal_send_refresh_mail && this.modalSendRefreshDataEmail()}

        <Marger size=".5rem" />

        <Hidden>
          <div id="form-dl-placeholder" />
        </Hidden>

        <Paper className={classes.root}>
          {/* Search input */}
          <div className={classes.table_search_filter}>
            <div className={classes.table_search}>
              <TextField
                className={classes.input_field}
                label="Rechercher"
                margin="normal"
                variant="outlined"
                onChange={this.searchChange}
              />
            </div>

            {/* Bouton modal options de filters */}
            <StudentFindOptions onChange={this.handleFilterChange} />
          </div>

          <div className={classes.tableWrapper}>
            <Table stickyHeader>
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
            count={this.active_rows!.length}
            rowsPerPage={this.state.rows_count}
            page={this.state.page}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Paper>

        <Marger size="3rem" />
        
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

const ModalSendMailBase = (props: {
  students: Student[],
  onClose: () => void,
  onSuccess: () => void,
  onDeleteRequest: (students: Student[]) => Promise<any>,
  text: string
}) => {
  const [inSend, setInSend] = React.useState(false);

  function sendRequest() {
    if (inSend) {
      return;
    }

    setInSend(true);

    props.onDeleteRequest(props.students)
      .then(() => {
        setInSend(false);
        toast("Les messages ont été envoyés", "success");
        props.onSuccess();
      })
      .catch(e => {
        notifyError(e);
        setInSend(false);
      });
  }

  return (
    <Dialog open onClose={props.onClose}>
      <DialogTitle>Envoyer ces e-mails ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Les étudiants sélectionnés recevront un e-mail {props.text}.
            Voulez-vous continuer ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} color="secondary" autoFocus>
            Annuler
          </Button>
          <Button onClick={sendRequest} color="primary">
            Confirmer
          </Button>
        </DialogActions>
    </Dialog>
  );
};

const ModalRefreshDataEmail = (props: { students: Student[], onClose: () => void, onSuccess: () => void }) => {
  return <ModalSendMailBase
    students={props.students}
    onClose={props.onClose}
    onSuccess={props.onSuccess}
    onDeleteRequest={students => APIHELPER.request('student/ask_refresh', {
      method: 'POST',
      parameters: {
        ids: students.map(e => e.id)
      }
    })}
    text="leur demandant de rafraîchir leur profil"
  />;
};

const ModalAskLoginEmail = (props: { students: Student[], onClose: () => void, onSuccess: () => void }) => {
  return <ModalSendMailBase
    students={props.students}
    onClose={props.onClose}
    onSuccess={props.onSuccess}
    onDeleteRequest={students => {
      const promises: Promise<any>[] = [];

      for (const student of students) {
        promises.push(
          APIHELPER.request('student/lost_token', {
            method: 'GET',
            parameters: {
              email: student.email
            }
          })
        );
      }
      
      return Promise.all(promises);
    }}
    text="leur demandant de se connecter"
  />;
};
