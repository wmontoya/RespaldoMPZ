
import { Activity, Event } from "@/types/sevri";
import * as Yup from "yup";
export const activityValidationSchema = Yup.object({
    title: Yup.string().required('El título es requerido'),
    subtitle: Yup.string().required('El subtítulo es requerido'),
    dependency: Yup.string().required('La dependencia es requerida'),
    // procedure_to_follow: Yup.string().required('El procedimiento a seguir es requerido')
});
export const getInitialValuesActivity = (department_name: string, department_id: string, sevri_process_id: number, editedActivity?: Activity) => {
    return {
        id: editedActivity?.id || undefined,
        title: editedActivity?.title || "",
        subtitle: editedActivity?.subtitle || "",
        dependency: editedActivity?.dependency || department_name,
        procedure_to_follow: editedActivity?.procedure_to_follow || "",
        activity_date: editedActivity?.activity_date || new Date().toISOString(),
        department_id: editedActivity?.department_id || department_id,
        sevri_process_id: editedActivity?.sevri_process_id || sevri_process_id,
    } as Activity
}
