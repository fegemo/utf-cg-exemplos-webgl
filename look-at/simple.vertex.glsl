#version 300 es

in vec3 a_coords;
in vec3 a_color;
in vec3 a_normal;
out vec3 v_normal;
out vec3 v_color;
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    mat3 normalMatrix = mat3(u_model);
    v_normal = normalMatrix * a_normal;
    v_color = a_color;
    gl_Position = u_projection * u_view * u_model * vec4(a_coords, 1.0);
}
