uniform float in_r;
uniform float in_g;
uniform float in_b;
uniform float out_r;
uniform float out_g;
uniform float out_b;

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
	vec4 u_targetColor = vec4(in_r, in_g, in_b, 1.0);
    vec4 texColor = texture2D(tex, uv);
    vec4 finalColor = texColor;
    float diff = distance(texColor.rgb, u_targetColor.rgb);
    if (diff < 0.1) {
        finalColor = vec4(out_r, out_g, out_b, 1.0);
    }
    return finalColor;
}