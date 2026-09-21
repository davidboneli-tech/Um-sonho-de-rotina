import React, { createContext, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { Settings } from "./domain";
import { illustrations, people } from "./assets";
export const themes = [
  {
    name: "Jardim delicado",
    primary: "#B75671",
    bg: "#FCF8F2",
    card: "#E9ECDD",
    second: "#EDE5F1",
    ink: "#422335",
    motif: "❀",
  },
  {
    name: "Lavanda",
    primary: "#865C96",
    bg: "#FAF7FD",
    card: "#EBE2F1",
    second: "#E3EBE2",
    ink: "#392343",
    motif: "❧",
  },
  {
    name: "Rosa de chá",
    primary: "#AD6067",
    bg: "#FBF5EF",
    card: "#F0DFD8",
    second: "#EDE5DA",
    ink: "#4F3031",
    motif: "♡",
  },
  {
    name: "Céu tranquilo",
    primary: "#446F91",
    bg: "#F6FAFC",
    card: "#DFEAF1",
    second: "#F0E9DC",
    ink: "#243F52",
    motif: "☁",
  },
  {
    name: "Essencial",
    primary: "#556E52",
    bg: "#FBFAF6",
    card: "#E7EADF",
    second: "#EEECE6",
    ink: "#293329",
    motif: "",
  },
];
const fallback: Settings = {
  theme: 0,
  color: "",
  font: 0,
  large: false,
  decoration: 1,
  biometric: false,
  availableStart: "14:00",
  availableEnd: "18:00",
};
export const ThemeContext = createContext(fallback);
export function useTheme() {
  const s = useContext(ThemeContext);
  const t = themes[s.theme] || themes[0];
  return {
    ...t,
    primary: s.color || t.primary,
    size: s.large ? 19 : 16,
    heading:
      s.font === 0
        ? Platform.OS === "ios"
          ? "Georgia"
          : "Georgia, Times New Roman, serif"
        : s.font === 1
          ? Platform.OS === "ios"
            ? "Avenir Next"
            : "Avenir Next, Trebuchet MS, sans-serif"
          : undefined,
    settings: s,
  };
}
export function Txt({ children, muted = false, style, ...rest }: any) {
  const t = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          color: muted ? "#706670" : t.ink,
          fontSize: t.size,
          lineHeight: t.size * 1.45,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Title({ children, small = false }: any) {
  const t = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={{
        color: t.ink,
        fontFamily: t.heading,
        fontSize: small ? 22 : 30,
        lineHeight: small ? 29 : 38,
        marginVertical: 8,
      }}
    >
      {children}
    </Text>
  );
}
export function Button({
  children,
  onPress,
  outline = false,
  danger = false,
  disabled = false,
  small = false,
}: any) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: outline
          ? "transparent"
          : danger
            ? "#983C43"
            : t.primary,
        opacity: disabled ? 0.45 : 1,
        borderColor: danger ? "#983C43" : t.primary,
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: small ? 7 : 11,
        paddingHorizontal: small ? 12 : 18,
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 5,
      }}
    >
      <Txt
        style={{
          color: outline ? (danger ? "#983C43" : t.primary) : "#FFFFFF",
          fontWeight: "600",
          textAlign: "center",
          fontSize: small ? 14 : t.size,
        }}
      >
        {children}
      </Txt>
    </Pressable>
  );
}
export function Card({ children, alternate = false, style }: any) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: alternate ? t.second : t.card,
          borderRadius: 22,
          padding: 17,
          marginVertical: 7,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  ...props
}: any) {
  const t = useTheme();
  return (
    <View style={{ marginVertical: 7, flexShrink: 1 }}>
      <Txt style={{ fontWeight: "600", marginBottom: 6 }}>{label}</Txt>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor="#817580"
        style={{
          color: t.ink,
          backgroundColor: "#FFFFFF",
          borderColor: "#D9CED5",
          borderWidth: 1,
          borderRadius: 13,
          padding: 13,
          fontSize: t.size,
          minHeight: multiline ? 98 : 48,
          textAlignVertical: multiline ? "top" : "center",
        }}
        {...props}
      />
    </View>
  );
}
export function Choices({
  values,
  value,
  onChange,
}: {
  values: { label: string; value: any }[];
  value: any;
  onChange: (v: any) => void;
}) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      {values.map((item, i) => (
        <Pressable
          key={i}
          accessibilityRole="button"
          accessibilityState={{ selected: item.value === value }}
          onPress={() => onChange(item.value)}
          style={{
            backgroundColor: item.value === value ? t.primary : "#FFFFFF90",
            borderColor: item.value === value ? t.primary : "#D9CED5",
            borderWidth: 1,
            borderRadius: 16,
            minHeight: 44,
            paddingHorizontal: 13,
            paddingVertical: 10,
          }}
        >
          <Txt
            style={{
              color: item.value === value ? "#FFF" : t.ink,
              fontSize: 14,
            }}
          >
            {item.label}
          </Txt>
        </Pressable>
      ))}
    </View>
  );
}
export function Check({ checked, label, onPress }: any) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[styles.row, { minHeight: 48, paddingVertical: 7 }]}
    >
      <View
        style={{
          width: 27,
          height: 27,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: t.primary,
          backgroundColor: checked ? t.primary : "#FFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 17 }}>
          {checked ? "✓" : ""}
        </Text>
      </View>
      <Txt style={{ flex: 1 }}>{label}</Txt>
    </Pressable>
  );
}
export function Art({ index, size = 85 }: { index: number; size?: number }) {
  return (
    <Image
      accessible={false}
      source={illustrations[index]?.source || illustrations[0].source}
      resizeMode="contain"
      style={{ width: size, height: size, borderRadius: 12 }}
    />
  );
}
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <View style={{ width:size, height:size, borderRadius:size/2, backgroundColor:"#F3E4DF", borderWidth:1, borderColor:"#FFFFFF", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Image accessibilityLabel={name} source={people[name] || people.Fabi}
        resizeMode="contain" style={{width:size*0.82,height:size*0.82}} />
    </View>
  );
}
export function ArtPicker({ value, onChange }: {value:number;onChange:(n:number)=>void}) {
  const t=useTheme();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:10,paddingVertical:10}}>
    {illustrations.map((item,i)=><Pressable key={item.name} accessibilityRole="button" accessibilityLabel={item.name} accessibilityState={{selected:value===i}} onPress={()=>onChange(i)} style={{width:78,height:82,alignItems:"center",justifyContent:"center",borderRadius:16,borderWidth:1.5,borderColor:value===i?t.primary:"#E3DAD4",backgroundColor:value===i?t.second:"#FFFFFF80"}}><Art index={i} size={64}/></Pressable>)}
  </ScrollView>;
}
export function Segments({ values, value, onChange }: {values:string[];value:string;onChange:(n:string)=>void}) {
  const t=useTheme();
  return <View style={{flexDirection:"row",backgroundColor:"#F1EAE5",borderRadius:15,padding:3,marginVertical:12}}>
    {values.map(label=><Pressable key={label} accessibilityRole="button" accessibilityState={{selected:value===label}} onPress={()=>onChange(label)} style={{flex:1,minHeight:44,justifyContent:"center",alignItems:"center",borderRadius:12,backgroundColor:value===label?t.primary:"transparent"}}><Txt style={{fontSize:15,color:value===label?"#FFF":t.ink}}>{label}</Txt></Pressable>)}
  </View>;
}
export function Flourish() {
  const t = useTheme();
  if (!t.settings.decoration || !t.motif) return null;
  return (
    <Text
      accessible={false}
      style={{
        color: t.primary,
        fontSize: 32,
        textAlign: "right",
        opacity: 0.6,
      }}
    >
      {t.settings.decoration === 2 ? `${t.motif}  ♡  ${t.motif}` : t.motif}
    </Text>
  );
}
export function Page({ children }: any) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 22, paddingBottom: 35 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
export const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginVertical: 7 },
  spread: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
});
