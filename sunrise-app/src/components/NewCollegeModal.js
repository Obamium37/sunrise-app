import { useState } from "react";
import styles from "./NewCollegeModal.module.css";

const NewCollegeModal = ({setIsOpen, onSubmit, newCollegeName, setNewCollegeName, deadline, setDeadline}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
    
        // Wait to finish the add operation
        const success = await onSubmit(e);
        setIsSubmitting(false);
    
        // Close modal only if add succeeded
        if (success) {
          setIsOpen(false);
        }
    };
    return(
        <div>
            <div className={styles.darkBG} onClick={() => setIsOpen(false)} />
            <div className={styles.centered}>
                <div className={styles['close-button-container']}>
                    <button className={styles['close-button']} onClick={() => setIsOpen(false)}>&#10005;</button>
                </div>
                <h2 className={styles['header']}>Add a college</h2>
                <form className={styles['form']} onSubmit={handleSubmit}>
                    <h4 className={styles['form-input-header']}>College Name</h4>
                    <div>
                        <input
                        className={styles['form-input']}
                        placeholder="College Name"
                        value={newCollegeName}
                        onChange={(e) => setNewCollegeName(e.target.value)}
                        required
                        />
                        <h4 className={styles['form-input-header']}>Application Deadline</h4>
                        <input
                        className={styles['form-input']}
                        type="date"
                        placeholder="Application Deadline"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                        />
                    </div>
                    <div className={styles['submit-button-container']}>
                        <button className={styles['submit-button']} type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add College"}
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );
}

export default NewCollegeModal;