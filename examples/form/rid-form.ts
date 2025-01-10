import { html, reactive } from "../rid";

interface FormState {
  username: string;
  email: string;
  bio: string;
  newsletter: boolean;
  skills: string[];
}

type FormStateKey = keyof FormState;

export const Form = () => {
  const state = reactive<FormState>({
    username: "",
    email: "",
    bio: "",
    newsletter: false,
    skills: [],
  });

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    console.log("Form submitted:", {
      username: state.username,
      email: state.email,
      bio: state.bio,
      newsletter: state.newsletter,
      skills: state.skills,
    });
  };

  const handleInput = (event: Event, field: FormStateKey) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (typeof state[field] === "string") {
      (state[field] as string) = target.value;
    }
  };

  const handleCheckbox = (event: Event) => {
    const target = event.target as HTMLInputElement;
    state.newsletter = target.checked;
  };

  const handleSkillDrop = (event: Event) => {
    event.preventDefault();
    const data = (event as DragEvent).dataTransfer?.getData("text/plain");
    if (data && !state.skills.includes(data)) {
      state.skills = [...state.skills, data];
    }
  };

  const preventDragover = (event: Event) => {
    event.preventDefault();
  };

  const renderSkillTag = (skill: string) => html`
    <span class="skill-tag">${skill}</span>
  `;

  const styles = `
    .rid-form {
      max-width: 500px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-group textarea {
      min-height: 100px;
      resize: vertical;
    }

    .skills-dropzone {
      min-height: 80px;
      border: 2px dashed #ddd;
      border-radius: 4px;
      padding: 10px;
      margin-top: 5px;
      background: #f9f9f9;
    }

    .skills-dropzone p {
      margin: 0;
      color: #666;
      text-align: center;
      line-height: 60px;
    }

    .skill-tag {
      display: inline-block;
      background: #e9ecef;
      padding: 4px 8px;
      border-radius: 4px;
      margin: 4px;
      font-size: 14px;
    }

    button[type="submit"] {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }

    button[type="submit"]:hover {
      background: #0056b3;
    }
  `;

  return html`
    <style>
      ${styles}
    </style>
    <form onsubmit=${handleSubmit} class="rid-form">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          type="text"
          id="username"
          value="${state.username}"
          oninput=${(event: Event) => handleInput(event, "username")}
        />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          value="${state.email}"
          oninput=${(event: Event) => handleInput(event, "email")}
        />
      </div>

      <div class="form-group">
        <label for="bio">Bio:</label>
        <textarea
          id="bio"
          oninput=${(event: Event) => handleInput(event, "bio")}
        >
${state.bio}</textarea
        >
      </div>

      <div class="form-group">
        <label>
          <input
            type="checkbox"
            ?checked=${state.newsletter}
            onchange=${handleCheckbox}
          />
          Subscribe to newsletter
        </label>
      </div>

      <div class="form-group">
        <label>Skills (Drag and Drop):</label>
        <div
          class="skills-dropzone"
          ondragover=${preventDragover}
          ondrop=${handleSkillDrop}
        >
          ${state.skills.length === 0
            ? html`<p>Drop skills here</p>`
            : state.skills.map(renderSkillTag)}
        </div>
      </div>

      <button type="submit">Submit</button>
    </form>
  `;
};
