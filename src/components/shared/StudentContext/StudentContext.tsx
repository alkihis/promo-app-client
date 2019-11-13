import { Student, Job } from "../../../interfaces";
import React from 'react';

// @ts-ignore
export const StudentContext = React.createContext<Student & { job?: Job, intership?: any }>();
export type StudentContextType = React.ContextType<typeof StudentContext>;
export type ExtendedStudent = Student & { job?: Job, intership?: any };

export default StudentContext;
