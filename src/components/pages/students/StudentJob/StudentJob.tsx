import classes from './StudentJob.module.scss';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Student, Job } from '../../../../interfaces';
import StudentContext, { ExtendedStudent } from '../../../shared/StudentContext/StudentContext';
import APIHELPER, { APIError } from '../../../../APIHelper';
import { errorToText, BigPreloader } from '../../../../helpers';
import { toast } from '../../../shared/Toaster/Toaster';
import EmbeddedError, { EmbeddedInfo }  from '../../../shared/EmbeddedError/EmbeddedError';
import { Link } from 'react-router-dom';

type SJState = {
  jobs?: Job[] | number;
};

export default class StudentJob extends React.Component<RouteComponentProps, SJState> {
  static contextType = StudentContext;
  context!: ExtendedStudent;

  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      jobs: undefined
    };
  }

  componentDidMount() {
    APIHELPER.request('job/all', { parameters: { id: this.context.id } })
      .then((jobs: Job[]) => {
        this.setState({
          jobs
        });
      })
      .catch(e => {
        if (Array.isArray(e) && APIHELPER.isApiError(e[1])) {
          this.setState({
            jobs: e[1].code
          });
        }
        else {
          toast("Erreur réseau.");
        }
      });
  }

  renderLoading() {
    return <BigPreloader style={{ marginTop: '50px' }} />;
  }

  renderError() {
    return <EmbeddedError error={this.state.jobs as number} />
  }

  renderEmpty() {
    return <EmbeddedInfo 
      text="Vous n'avez aucun emploi enregistré" 
      link={{
        to: "job/add",
        internal: true,
        text: "Ajouter un emploi"
      }}
    />;
  }

  renderJobs() {
    return (this.state.jobs as Job[]).map(j => 
      <pre key={j.id}>
        {JSON.stringify(j, null, 2)}
        <Link to="job/modify/" onClick={() => this.context.job = j} className="link">
          Modifier
        </Link>
      </pre>
    );
  }

  render() {
    if (this.state.jobs === undefined) {
      return this.renderLoading();
    }

    if (typeof this.state.jobs === 'number') {
      return this.renderError();
    }

    // is array
    if (this.state.jobs.length === 0) {
      return this.renderEmpty();
    }

    return this.renderJobs();
  }
}
